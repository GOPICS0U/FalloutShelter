# 💣 Bombermine Resource Pack — Skeleton
**Target Version:** 1.21.x  
**Developed by:** SirPachaman x e5ENTIAL  

This is the official resource pack skeleton for the **Bombermine** mini-game. This repository provides the required folder structure and configuration files but contains no textures or models by default.

---

## 📂 Project Structure

To build the pack, add your assets into the following directories:

### 🎨 Textures & Graphics
* **Blocks & Items:** `assets/minecraft/textures/block/` | `item/`
* **Entities (Mobs):** `assets/minecraft/textures/entity/`
* **Particles:** `assets/minecraft/textures/particle/`
* **Interface (GUI):** `assets/minecraft/textures/gui/` (Menus, inventory, icons, and bossbars)

### 🏗️ 3D Modeling (Blockbench)
* **Models:** `assets/minecraft/models/item/` | `block/` (Exported JSON files)

### 🔊 Audio & Sound Design
* **Sound Files:** `assets/minecraft/sounds/` (Must be in `.ogg` format)
* **Configuration:** `assets/minecraft/sounds.json` (Required to register sound events)

### 🌍 Localization & Fonts
* **Translations:** `assets/minecraft/lang/` (e.g., `en_us.json`, `fr_fr.json`)
* **Custom Fonts:** * Glyphs: `assets/minecraft/textures/font/`
    * Layouts: `assets/minecraft/font/`

---

## ⚙️ Technical Notes
* **Pack Format:** Configured for high compatibility with Minecraft 1.21.x.
* **Requirements:** Ensure all textures use a power-of-two resolution (e.g., 16x, 32x, 64x) to avoid mipmapping issues.
* **Validation:** Use a JSON validator for `sounds.json` and model files to prevent the "Broken" status in the resource pack menu.

---
*This skeleton is designed to be a lightweight starting point for Bombermine developers.*
