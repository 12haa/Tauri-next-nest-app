use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // You can trigger update check on startup here if needed
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
        // Auto-download and install (optional - you can handle this in frontend)
        // update.download_and_install(|_, _| {}, || {}).await?;
    }

    Ok(())
}