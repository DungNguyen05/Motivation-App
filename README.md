# 💪 Motivation App - Ứng dụng Thúc đẩy Động lực

Ứng dụng mobile thông minh sử dụng AI để tạo ra những lời nhắc động lực cá nhân hóa, giúp bạn đạt được mục tiêu của mình.

## 🌟 Tính năng chính

### ✨ **AI Thông minh**
- Phân tích mục tiêu của bạn bằng Google Gemini AI
- Tạo kế hoạch động lực chi tiết và cá nhân hóa
- Lời nhắc được tối ưu theo thời gian và loại mục tiêu

### 🎯 **Đơn giản & Hiệu quả**
- Giao diện tiếng Việt thân thiện
- Chỉ cần nhập mục tiêu và thời gian
- Không cần tạo tài khoản hay cấu hình phức tạp

### 🔔 **Thông báo thông minh**
- Nhận lời nhắc động lực đúng lúc
- Hoạt động ngay cả khi app đóng
- Tần suất thông báo được AI tối ưu

## 🚀 Cài đặt & Khởi chạy

### 📋 Yêu cầu hệ thống

- **Node.js** phiên bản 16 trở lên: [Tải tại đây](https://nodejs.org/)
- **Expo CLI**: `npm install -g @expo/cli`
- **Điện thoại** với ứng dụng Expo Go:
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Tài khoản Google** (để lấy API key miễn phí)

### 🔧 Bước 1: Tải mã nguồn

```bash
# Clone repository
git clone <your-repository-url>
cd motivation-app

# Cài đặt dependencies
npm install
```

### 🔑 Bước 2: Cấu hình API Key (QUAN TRỌNG)

#### Lấy Google Gemini API Key miễn phí:

1. **Truy cập**: https://aistudio.google.com/app/apikey
2. **Đăng nhập** với tài khoản Google
3. **Nhấn "Create API key"**
4. **Copy API key** (bắt đầu bằng `AIza...`)

#### Tạo file cấu hình:

```bash
# Tạo file .env trong thư mục gốc
touch .env
```

Thêm nội dung vào file `.env`:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Lưu ý:** Thay `XXXXXXXXX` bằng API key thật của bạn

### 🏃‍♂️ Bước 3: Khởi chạy ứng dụng

```bash
# Khởi động development server
npm start

# Hoặc
npx expo start
```

### 📱 Bước 4: Mở trên điện thoại

#### **Cách 1: Cùng WiFi (Đơn giản nhất)**
1. Đảm bảo điện thoại và máy tính cùng mạng WiFi
2. Mở ứng dụng **Expo Go** trên điện thoại
3. **Quét QR code** hiển thị trên terminal/browser
4. Ứng dụng sẽ tự động tải và chạy

#### **Cách 2: Khác mạng WiFi (Tunnel)**
```bash
# Sử dụng tunnel mode
npx expo start --tunnel
```
- Quét QR code như bình thường
- Chậm hơn nhưng hoạt động qua internet

#### **Cách 3: Emulator/Simulator**
```bash
# Android Emulator (cần Android Studio)
npm run android

# iOS Simulator (chỉ trên Mac, cần Xcode)
npm run ios
```

## 🎯 Cách sử dụng

### 1. **Khởi động lần đầu**
- Cấp quyền thông báo khi được yêu cầu
- Ứng dụng sẽ tự động kiểm tra API key

### 2. **Tạo mục tiêu mới**
- Nhấn **"🎯 Mục tiêu mới"**
- Nhập mục tiêu của bạn (VD: "Học tiếng Anh", "Tập thể dục")
- Chọn thời gian thực hiện (1 tuần đến 1 năm)
- Nhấn **"✨ Tạo kế hoạch động lực"**

### 3. **AI tạo kế hoạch**
- AI phân tích mục tiêu
- Tạo 8-15 lời nhắc động lực
- Tự động đặt lịch thông báo

### 4. **Nhận thông báo**
- Lời nhắc sẽ được gửi theo lịch
- Mỗi thông báo là một câu động lực cụ thể
- Giúp bạn duy trì động lực hàng ngày

## 🛠️ Xử lý sự cố

### ❌ **Không kết nối được**

**Lỗi:** QR code không hoạt động

**Giải pháp:**
```bash
# Thử tunnel mode
npx expo start --tunnel

# Hoặc clear cache
npx expo start --clear
```

### ❌ **API không hoạt động**

**Lỗi:** "API key không hợp lệ"

**Giải pháp:**
1. Kiểm tra file `.env` có đúng tên không
2. Đảm bảo API key đúng định dạng `AIza...`
3. Restart development server: `npm start`

**Kiểm tra API key:**
```bash
# Kiểm tra file .env có tồn tại không
ls -la | grep .env

# Kiểm tra nội dung (không hiển thị key)
echo "API Key configured: $(grep -c EXPO_PUBLIC_GEMINI_API_KEY .env)"
```

### ❌ **Thông báo không hoạt động**

**Lỗi:** Không nhận được thông báo

**Giải pháp:**
1. Kiểm tra quyền thông báo trong Settings điện thoại
2. Đảm bảo ứng dụng không bị tối ưu pin tự động tắt
3. Test với thời gian gần (vài phút)

### ❌ **Ứng dụng crash**

**Lỗi:** App bị đóng đột ngột

**Giải pháp:**
```bash
# Clear cache và restart
npx expo start --clear

# Kiểm tra logs
npx expo start --dev-client
```

## 📊 Giới hạn miễn phí

### **Google Gemini API (Miễn phí)**
- ✅ **15 requests/phút**
- ✅ **1,500 requests/ngày**  
- ✅ **Không cần thẻ tín dụng**
- ✅ **Đủ cho nhiều người dùng**

### **Sử dụng hợp lý:**
- Một mục tiêu = ~1 request
- Có thể tạo 50+ mục tiêu/ngày
- Reset mỗi 24 giờ

## 🔄 Cập nhật & Phát triển

### **Cập nhật dependencies:**
```bash
# Cập nhật Expo SDK
npx expo install --fix

# Cập nhật packages
npm update
```

### **Build production:**
```bash
# Build APK cho Android
npx expo build:android

# Build cho iOS (cần Apple Developer account)
npx expo build:ios
```

### **Deploy updates:**
```bash
# Publish OTA update
npx expo publish
```

## 📁 Cấu trúc dự án

```
motivation-app/
├── src/
│   ├── components/
│   │   ├── GoalForm.tsx          # Form nhập mục tiêu
│   │   └── MotivationItem.tsx    # Hiển thị lời nhắc
│   ├── hooks/
│   │   └── useMotivation.ts      # React hook chính
│   ├── services/
│   │   ├── AIService.ts          # Tích hợp Google Gemini
│   │   ├── MotivationService.ts  # Logic chính
│   │   ├── NotificationService.ts # Quản lý thông báo
│   │   └── StorageService.ts     # Lưu trữ local
│   └── types/
│       └── index.ts              # TypeScript types
├── App.tsx                       # Component chính
├── app.json                      # Cấu hình Expo
├── package.json                  # Dependencies
├── .env                         # API keys (TỰ TẠO)
└── README.md                    # File này
```

## 🎨 Tùy chỉnh

### **Thay đổi màu sắc:**
- Mở `App.tsx`
- Tìm `colors: ['#667eea', '#764ba2']`
- Thay đổi theo ý muốn

### **Thêm ngôn ngữ:**
- Tạo folder `src/locales/`
- Thêm file JSON cho từng ngôn ngữ
- Cập nhật components

### **Thay đổi AI prompts:**
- Mở `src/services/AIService.ts`
- Tìm phần `prompt` trong `analyzeGoal()`
- Chỉnh sửa để phù hợp

## 🤝 Đóng góp

### **Báo lỗi:**
1. Tạo issue mới
2. Mô tả chi tiết lỗi
3. Đính kèm screenshot nếu có

### **Đề xuất tính năng:**
1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -am 'Thêm tính năng mới'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

## 📞 Hỗ trợ

### **Cần giúp đỡ?**
- 📧 Email: your-email@example.com
- 💬 GitHub Issues: [Tạo issue mới](https://github.com/your-username/motivation-app/issues)
- 📱 Telegram: @your-username

### **Tài liệu hữu ích:**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Guide](https://reactnative.dev/docs/getting-started)
- [Google Gemini API](https://ai.google.dev/docs)

## 📄 Giấy phép

MIT License - Sử dụng tự do cho mục đích học tập và cá nhân.

---

**🎉 Chúc bạn thành công với mục tiêu của mình!**

*Được phát triển với ❤️ và AI*