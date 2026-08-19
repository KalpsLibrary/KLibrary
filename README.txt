KLIBRARY SETUP

1. Open supabase-config.js in Notepad.
2. Replace:
   PASTE_YOUR_PUBLISHABLE_KEY_HERE
   with your Supabase PUBLISHABLE key.
3. Save all files in the same folder.
4. Double-click index.html to test the design.

IMPORTANT:
- The publishable/anon key is intended for browser use.
- Never put a Supabase secret or service_role key in this file.
- Supabase Auth stores the registered accounts. We do not store passwords ourselves.

For the first local test, if Supabase asks users to confirm their email, the signup page will tell them to check email. We can adjust that setting later if you want a simpler local demo.


CART SETUP: Run KLibrary_cart_setup.sql in Supabase SQL Editor before testing the cart.
