// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Start the sidecar
            let app_handle = app.handle();
            let app_data_dir = app_handle.path().app_data_dir().expect("failed to get app data dir");
            let resource_dir = app_handle.path().resource_dir().expect("failed to get resource dir");

            let migrations_dir = resource_dir.join("migrations");

            let sidecar_command = app.shell().sidecar("api").unwrap();
            let (mut rx, mut _child) = sidecar_command
                .env("APP_DATA_DIR", app_data_dir.to_string_lossy().to_string())
                .env("MIGRATIONS_DIR", migrations_dir.to_string_lossy().to_string())
                .env("PORT", "3001")
                .spawn()
                .expect("Failed to spawn sidecar");

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            println!("[API] {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            eprintln!("[API] {}", String::from_utf8_lossy(&line));
                        }
                        _ => {}
                    }
                }
            });

            // Trigger update check on startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update_check(handle).await {
                    eprintln!("Failed to check for updates: {}", e);
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update_check(app: tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_updater::UpdaterExt;

    if let Some(update) = app.updater()?.check().await? {
        println!("Update available: {}", update.version);

        // Ask user for permission to update
        if confirm_update(&app, &update.version).await {
            // Download and install the update
            // The download_and_install method requires callback functions
            match update.download_and_install(
                |chunk_length, content_length| {
                    // on_chunk - called to report download progress
                    if let Some(total) = content_length {
                        println!("Downloaded: {}/{}", chunk_length, total);
                    } else {
                        println!("Downloaded: {} bytes", chunk_length);
                    }
                },
                || {
                    // on_download_finish - called when download is complete
                    println!("Download finished, installing update...");
                }
            ).await {
                Ok(_) => {
                    println!("Update installed successfully. Restarting app...");
                    app.restart();
                }
                Err(e) => {
                    eprintln!("Failed to install update: {}", e);
                }
            }
        }
    } else {
        println!("No updates available");
    }

    Ok(())
}

async fn confirm_update(_app: &tauri::AppHandle, version: &str) -> bool {
    // For now, just automatically accept updates
    // In a real application, you'd want to show a dialog to the user
    println!("Update available: {} - automatically proceeding with update", version);
    true
}
