use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;
use sqlx::{sqlite::SqlitePoolOptions, FromRow};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
struct User {
    id: i64,
    name: String,
    email: String,
    password: String,
    age: Option<i64>,
    phone: Option<String>,
    profile_picture: Option<String>,
    bio: Option<String>,
    address: Option<String>,
    role: Option<String>,
    date_of_birth: Option<String>,
    date_of_death: Option<String>,
    last_login_at: Option<String>,
    created_at: Option<String>,
    updated_at: Option<String>,
    updated_from: Option<String>,
}

#[tauri::command]
async fn get_users(app_handle: tauri::AppHandle) -> Result<Vec<User>, String> {
    let db_url = get_db_url(&app_handle)?;

    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to query users: {}", e))?;

    Ok(users)
}

#[tauri::command]
async fn add_user(
    app_handle: tauri::AppHandle,
    name: String,
    email: String,
    password: String,
) -> Result<(), String> {
    let db_url = get_db_url(&app_handle)?;

    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query("INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
        .bind(name)
        .bind(email)
        .bind(password)
        .bind(now.clone())
        .bind(now)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to add user: {}", e))?;

    Ok(())
}

fn get_db_url(app_handle: &tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Ensure the directory exists
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let db_path = app_data_dir.join("app.db");

    Ok(format!("sqlite:{}", db_path.to_string_lossy()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri_plugin_sql::{Migration, MigrationKind};

    let migrations = vec![
        Migration {
            version: 1,
            description: "create users table",
            sql: include_str!("../../../web/drizzle/migrations/0000_melted_tomorrow_man.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:app.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, get_users, add_user])
        .setup(|app| {
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
