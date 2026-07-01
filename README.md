# Professor VPN — Download Page

صفحه دانلود دارک، گوتیک-سایبرپانک و کاملاً ریسپانسیو با تشخیص خودکار آخرین نسخه.

## ویژگی‌ها
- 🎨 طراحی دارک بر اساس لوگوی رسمی Professor VPN (بنفش نئونی · مشکی · نقره‌ای گرانج) با حلقه نئون چرخان، الگوی مدار/نقشه جهان پیکسلی و انیمیشن
- 🔄 **به‌روزرسانی خودکار نسخه** — بدون نیاز به سرور اختصاصی؛ آخرین فایل `.apk` به‌صورت آنلاین تشخیص داده می‌شود (هم‌اکنون: **v4.6**؛ هر زمان منبع آپدیت شود نسخهٔ جدید به‌صورت خودکار نمایش داده می‌شود)
- 🔒 **مخفی‌سازی کامل منبع** — آدرس ریپازیتوری فقط در کد سمت‌سرور (Cloudflare Worker) است و هرگز به مرورگر/کلاینت ارسال نمی‌شود
- 📶 **دانلود مقاوم در برابر نت ضعیف/فیلتر** — پراکسی استریم با پشتیبانی Range/Resume برای ادامه دانلود
- 🛡️ امنیت: whitelist نام فایل، جلوگیری از path-traversal، هدرهای امنیتی، `noindex`

## ساختار
```
src/index.js   # Cloudflare Worker: صفحه + /api/version + /api/download (منبع اینجا و فقط سمت‌سرور)
src/page.js    # HTML صفحه (embedded)
src/icon.js    # آیکون (embedded base64)
public/        # نسخه استاتیک (برای Cloudflare Pages هم قابل استفاده)
wrangler.toml  # پیکربندی Cloudflare
```

## اجرای محلی
```bash
npm install
npm run dev      # http://localhost:3000
```

## دیپلوی روی Cloudflare
```bash
npm run deploy   # wrangler deploy
```

### پیکربندی منبع (اختیاری، برای امنیت بیشتر)
به‌جای مقادیر پیش‌فرض داخل کد، می‌توانید از Secret/Var استفاده کنید تا منبع کاملاً خارج از کد بماند:
```bash
wrangler secret put SRC_OWNER
wrangler secret put SRC_REPO
wrangler secret put SRC_BRANCH
wrangler secret put SRC_BUILD_DIR
wrangler secret put GH_TOKEN     # اختیاری: افزایش rate-limit گیت‌هاب
```

> هیچ آدرس ریپازیتوری در فایل‌های کلاینت (`public/`, HTML, JS مرورگر) وجود ندارد.
