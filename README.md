# HVAC AR

Havalandırma (HVAC) sektörü için **Sürükle-Bırak** mantığıyla çalışan 3D/AR ölçü ve
projelendirme uygulaması. Tek kod tabanı (iOS + Android), ileride tablet + donanım
paketi olarak satış hedefli.

## Teknoloji Yığını (PoC)

- **Expo SDK 57** + `expo-dev-client` (prebuild / CNG workflow)
- **@reactvision/react-viro** — ARKit / ARCore soyutlaması, `.glb` desteği
- **TypeScript**, **Zustand** (state), **React Navigation**, **zod** (şema doğrulama)
- Kalıcılık: `expo-file-system` (PoC) → ileride `expo-sqlite`
- 🔑 Yerel kayıt formatı = JSON export formatı (tek şema iki işi görür)

## Yol Haritası

| Faz | Durum | Çıktı |
|-----|-------|-------|
| 0 | ✅ | Repo + Expo/Viro iskeleti, cihazda boş AR sahnesi |
| 1 | ⏳ | Tarama + tavan/zemin plane detection |
| 2 | ⏳ | Malzeme paleti + drag-drop yerleştirme |
| 3 | ⏳ | Seçim + döndür / taşı / sil |
| 4 | ⏳ | JSON şeması + yerel kayıt |
| 5 | ⏳ | Projeler listesi + saha dışı 3D viewer |
| 6 | ⏳ | Metraj JSON export + responsive tablet + gerçek .glb |

## Çalıştırma

> ⚠️ AR **simülatörde/emülatörde çalışmaz**. Gerçek bir iOS/Android cihaz gerekir.
> `ios/` ve `android/` klasörleri `app.json`'dan üretilir (gitignore'lu); ilk çalıştırmada
> otomatik oluşur.

**iOS (gerçek cihaz, macOS + Xcode):**
```bash
npx expo run:ios --device
```

**Android (gerçek cihaz, USB hata ayıklama açık):**
```bash
npx expo run:android --device
```

Native klasörleri yeniden üretmek için:
```bash
npx expo prebuild --clean
```

## Klasör Yapısı

```
src/
├─ screens/        # ekranlar (AR, Projeler, Viewer, Home)
├─ ar/             # ViroARScene, yerleştirilebilir parçalar, AR yardımcıları
├─ components/     # UI: malzeme paleti, tarama overlay, transform kontrol
├─ catalog/        # parça kataloğu (kanal, dirsek, ...)
├─ store/          # Zustand sahne state
├─ data/           # JSON şema, repository (kaydet/yükle), export
└─ theme/          # telefon ↔ tablet responsive
```
