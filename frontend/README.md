# Bike Tracker — Frontend (React + Vite)

Ye frontend tumhare Express backend (`bike-tracker-backend`) ke sath kaam karne ke liye bana hai.

## Setup

```bash
npm install
cp .env.example .env
# .env mein VITE_API_URL apne backend ke URL se set karo
npm run dev
```

Backend ka `FRONTEND_URL` env variable is frontend ke URL se match hona chahiye
(dev mein `http://localhost:5173`), warna CORS block kar dega.

## Backend mein ek chhota sa addition zaroori hai

Is frontend ko kaam karne ke liye ek naya route chahiye tha jo tumhare original
backend mein nahi tha: **"is bike ki abhi active theft report hai ya nahi"**
check karna (page refresh hone ke baad bhi). Maine ye 2 files update ki hain
(diye gaye hain):

- `theftController.js` — `getActiveReport` function add kiya
- `theftRoutes.js` — `GET /api/theft/:bikeId/active` route add kiya (ownership-protected, jaisa `report` route hai)

Koi behavior change nahi hua, sirf ek naya read-only route add hua hai.

## Pages

- `/login`, `/register` — auth
- `/dashboard` — apni bikes ki list (admin ko sab dikhti hain)
- `/bikes/new` — nayi bike add karna
- `/bikes/:id` — bike detail: tracker status, live location (map), location
  history (path line on map + table), theft report banana/resolve karna, PDF download
- `/admin/link-tracker` — sirf admin: tracker (IMEI) ko bike se link karna

## Security decisions (aur unki limitations, honestly)

1. **JWT token storage**: token `localStorage` mein rakha jata hai aur axios
   interceptor se har request ke sath bheja jata hai. Ye sabse aam approach
   hai lekin iska ek jana-mana risk hai: agar kabhi frontend mein XSS
   vulnerability aa jaye, to attacker token chura sakta hai. React khud
   auto-escape karta hai (hum kahin bhi `dangerouslySetInnerHTML` use nahi
   kar rahe), isliye risk kam hai, lekin **"100% secure" koi bhi system
   literally nahi hota** — ye industry-standard best practice hai, guarantee
   nahi.
   - Isse aur mazboot banane ka tareeqa: backend token ko `httpOnly` cookie
     mein bheje (JS se access hi na ho sake) — agar chaho to main ye
     backend + frontend dono mein badal sakta hoon.

2. **401 par auto-logout**: token invalid/expire ho to turant login page
   par bhej diya jata hai — purana session leke ghoomna nahi hota.

3. **Client-side validation backend ke regex se match karta hai** (CNIC,
   phone, number plate) — lekin ye sirf UX ke liye hai. Asal security
   hamesha backend validation se aati hai (jo already tumhare paas hai),
   frontend validation kabhi akela bharosemand nahi hota.

4. **Role-based route guard** (`AdminRoute`) sirf UI ke liye hai — galat
   page dikhne se bachata hai. Asal enforcement backend ke `adminOnly`
   middleware se hoti hai.

5. **PDF download** Authorization header ke sath authenticated `blob`
   fetch se hota hai, kyunke normal `<a href="...">` link JWT header
   nahi bhej sakta.

6. **CSP header** `index.html` mein baseline ke taur par diya hai — production
   deployment (Nginx/Vercel/Netlify) mein isko response headers se bhi
   set karna chahiye, aur apne actual domain ke hisaab se tight karna chahiye.

7. Koi bhi secret (`JWT_SECRET`, `INGEST_SECRET`) is frontend mein kahin
   nahi hai aur na hona chahiye — wo sirf backend `.env` mein rehte hain.

## Build for production

```bash
npm run build
```

`dist/` folder ban jayega — usay kisi bhi static host (Nginx, Vercel,
Netlify, S3+CloudFront) par deploy kar sakte ho. Deploy karte waqt
`VITE_API_URL` ko apne production backend ke **HTTPS** URL par set karna
zaroori hai (HTTP par JWT token network mein plain text jayega).
