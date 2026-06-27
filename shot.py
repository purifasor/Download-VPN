import asyncio
from playwright.async_api import async_playwright

URL = "http://localhost:8000"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        # Mobile view
        m = await browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await m.goto(URL, wait_until="networkidle")
        await m.wait_for_timeout(3500)
        await m.screenshot(path="shot-mobile.png", full_page=True)
        print("mobile done")
        await m.close()
        # Desktop view
        d = await browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=1)
        await d.goto(URL, wait_until="networkidle")
        await d.wait_for_timeout(3500)
        await d.screenshot(path="shot-desktop.png")
        print("desktop done")
        await browser.close()

asyncio.run(main())
