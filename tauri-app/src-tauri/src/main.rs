#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("سلام {}! از Tauri", name)
}

#[tauri::command]
fn get_system_info() -> String {
    format!(
        "OS: {} | Arch: {}",
        std::env::consts::OS,
        std::env::consts::ARCH
    )
}

fn main() {
    tauri::Builder::default()
        // add the updater plugin
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())

        // keep your setup logic
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app
                    .get_webview_window("main")
                    .expect("پنجره main پیدا نشد");
                window.open_devtools();
            }
            Ok(())
        })

        // keep your invoke handler
        .invoke_handler(tauri::generate_handler![greet, get_system_info])

        // run app
        .run(tauri::generate_context!())
        .expect("خطا هنگام اجرای برنامه Tauri");
}
