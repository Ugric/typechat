const cached = {};

const errorresp = new Response(
  `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <title>TypeChat - OFFLINE</title>
      <style>
        body {
          display: flex;
  		  font-family: helvetica !important;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #3b3bd3;
          padding: 0;
          margin: 0;
        }
        .container {
        	max-width: 500px;
            text-align: center;
        }
      </style>
      <script>
        window.addEventListener('online', () => {
          window.location.reload();
        })
      </script>
    </head>
    <body>
      <div class="container">
      <svg class="img-fluid" id="outputsvg" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 7960 2090">
    <g id="l2UgOC7364pAM0IVR9bgd5c" fill="rgb(86,86,255)">
        <g>
            <path id="p2pqnzwar" d="M191 2068 c-74 -28 -142 -97 -170 -171 -21 -57 -21 -65 -21 -832 0 -767 0 -775 21 -832 45 -119 148 -185 319 -204 52 -6 1483 -8 3695 -7 l3610 3 65 22 c122 42 182 102 222 222 22 65 22 77 26 728 3 696 -1 796 -39 897 -29 79 -95 146 -172 175 l-58 21 -3722 -1 -3722 0 -54 -21z m2741 -153 c59 -39 91 -92 151 -252 75 -198 244 -643 253 -666 6 -16 2 -18 -32 -15 l-38 3 -41 110 c-23 61 -68 181 -99 268 l-58 157 -32 0 c-28 0 -34 -5 -43 -32 -6 -18 -39 -107 -73 -198 -34 -91 -73 -198 -87 -237 l-25 -73 -44 0 -44 0 26 68 c14 37 45 119 69 182 24 63 71 186 104 274 35 92 61 174 61 196 0 91 -60 160 -138 160 -26 0 -62 -4 -80 -9 -30 -9 -33 -7 -47 20 l-16 30 53 25 c64 30 123 27 180 -11z m678 -145 l0 -170 33 0 c20 0 47 10 68 26 78 59 134 67 226 33 142 -54 234 -230 206 -394 -15 -86 -47 -150 -103 -206 -48 -48 -135 -89 -189 -89 -43 0 -108 26 -151 60 -24 19 -49 30 -69 30 -30 0 -31 -2 -31 -40 l0 -40 -45 0 -45 0 0 480 0 480 50 0 50 0 0 -170z m1141 -119 c24 -12 55 -31 68 -42 22 -18 22 -20 8 -43 l-16 -24 -43 21 c-51 26 -163 34 -225 18 -83 -22 -143 -101 -143 -186 l0 -45 255 0 255 0 0 -28 c0 -40 -26 -136 -51 -183 -52 -102 -175 -177 -273 -165 -104 12 -191 78 -248 188 -30 58 -32 71 -33 158 0 82 4 103 26 151 46 97 120 165 212 195 58 19 154 12 208 -15z m-2351 -401 l0 -420 145 0 145 0 0 -45 0 -45 -340 0 -340 0 0 45 0 45 145 0 145 0 0 420 0 420 50 0 50 0 0 -420z m3513 -17 c4 -19 2 -33 -3 -33 -6 0 -10 17 -10 37 0 43 5 41 13 -4z"></path>
            <path id="pvVvYhEvm" d="M3720 1568 c-31 -16 -54 -39 -75 -72 -29 -48 -30 -53 -30 -171 0 -118 1 -123 30 -171 44 -71 97 -96 196 -92 92 4 135 29 176 103 26 46 28 58 28 160 0 102 -2 114 -28 160 -41 74 -84 99 -176 103 -64 3 -83 -1 -121 -20z"></path>
            <path id="p11pTedRQT" d="M4400 1240 c0 -53 24 -112 57 -142 49 -44 152 -61 235 -38 67 19 128 114 128 199 l0 31 -210 0 -210 0 0 -50z"></path>
        </g>
    </g>
    <g id="l3rIhIJog1hyR2jPD3tJtWp" fill="rgb(255,255,0)">
        <g>
            <path id="ptCMwFJ82" d="M2730 1960 c-82 -38 -84 -43 -48 -114 17 -33 32 -63 33 -64 2 -2 16 6 32 17 15 11 46 23 69 27 36 5 45 2 76 -24 19 -17 40 -48 47 -69 12 -36 9 -46 -49 -198 -34 -88 -77 -200 -95 -250 -18 -49 -54 -143 -79 -208 -25 -65 -46 -120 -46 -122 0 -3 38 -5 84 -5 l84 0 25 73 c14 39 53 146 87 237 34 91 67 180 74 199 l13 35 58 -160 c32 -87 77 -208 100 -269 l41 -110 78 -3 c77 -3 78 -3 70 20 -3 13 -53 147 -111 298 -57 151 -129 342 -160 423 -85 226 -133 277 -266 284 -58 3 -81 0 -117 -17z"></path>
            <path id="pyjnatQbi" d="M3480 1460 l0 -510 75 0 75 0 0 41 0 41 39 -31 c52 -41 111 -61 182 -61 193 0 329 159 329 385 -1 229 -136 385 -334 385 -69 0 -112 -14 -166 -55 l-35 -26 -3 171 -2 170 -80 0 -80 0 0 -510z m444 69 c20 -13 48 -46 63 -74 24 -43 28 -61 28 -130 0 -69 -4 -87 -28 -130 -74 -134 -233 -139 -312 -11 -28 46 -30 57 -30 141 0 84 2 95 30 141 56 92 167 120 249 63z"></path>
            <path id="puficG5nj" d="M4513 1696 c-92 -30 -166 -98 -212 -195 -24 -51 -26 -67 -26 -181 0 -122 1 -127 33 -188 64 -124 152 -183 281 -190 61 -3 87 0 133 18 131 49 218 194 218 362 l0 58 -255 0 c-284 0 -272 -3 -235 69 61 120 234 148 332 54 17 -16 31 -23 36 -17 4 5 24 30 45 55 l36 46 -34 35 c-60 59 -118 82 -220 85 -56 2 -106 -2 -132 -11z m272 -458 c-45 -148 -181 -202 -290 -116 -29 23 -65 87 -65 118 0 19 5 20 181 20 l180 0 -6 -22z"></path>
            <path id="pCBEm0Ru7" d="M2270 1280 l0 -420 -145 0 -145 0 0 -75 0 -75 370 0 370 0 0 75 0 75 -145 0 -145 0 0 420 0 420 -80 0 -80 0 0 -420z"></path>
        </g>
    </g>
    <g id="l3uQV9qOe4gpsRCTdzglTX2" fill="rgb(255,170,86)">
        <g>
            <path id="pVgSr4P8h" d="M5353 1729 c-146 -28 -265 -141 -313 -296 -28 -90 -28 -246 0 -336 66 -215 264 -339 466 -292 72 16 165 69 183 104 8 14 6 22 -9 36 -18 17 -21 16 -61 -18 -54 -47 -116 -67 -204 -67 -129 0 -235 73 -296 204 -76 162 -48 379 66 505 20 22 66 55 101 72 60 30 69 31 151 27 95 -5 129 -17 188 -70 l36 -31 21 21 22 21 -39 35 c-46 42 -102 70 -173 85 -59 12 -79 12 -139 0z"></path>
            <path id="p1C7S40e94" d="M7385 1725 c-51 -18 -81 -56 -95 -118 -5 -26 -10 -151 -10 -277 l0 -230 -50 0 c-49 0 -50 -1 -50 -30 0 -29 1 -30 50 -30 l49 0 3 -77 c3 -77 3 -78 31 -81 l27 -3 0 80 0 81 95 0 95 0 0 30 0 30 -95 0 -95 0 0 229 c0 256 3 280 36 316 18 20 33 25 71 25 27 0 58 -7 70 -15 20 -14 23 -14 33 6 16 29 -8 54 -65 68 -53 13 -51 13 -100 -4z"></path>
            <path id="p1DdIKgjgS" d="M5870 1240 l0 -490 30 0 30 0 0 212 0 211 29 -40 c84 -116 261 -133 360 -34 65 65 73 102 78 384 l5 247 -30 0 -30 0 -4 -242 c-3 -222 -5 -247 -24 -288 -27 -58 -53 -80 -110 -95 -104 -26 -195 15 -244 111 -24 48 -25 56 -28 282 l-4 232 -29 0 -29 0 0 -490z"></path>
            <path id="p1HSUZYPP8" d="M6692 1716 c-102 -36 -151 -166 -103 -271 39 -85 87 -104 270 -105 l134 0 -6 -66 c-11 -120 -65 -174 -174 -174 -69 0 -114 15 -167 55 l-35 26 -11 -21 c-10 -19 -8 -26 16 -51 61 -64 221 -93 305 -56 47 21 95 76 108 124 6 22 11 147 11 296 l0 257 -25 0 c-24 0 -25 -3 -25 -55 l0 -54 -42 42 c-25 25 -60 48 -84 55 -51 15 -128 14 -172 -2z m211 -73 c58 -40 86 -102 87 -185 l0 -68 -122 1 c-144 0 -184 11 -216 59 -20 29 -23 44 -20 92 7 95 67 142 172 134 44 -3 69 -12 99 -33z"></path>
        </g>
    </g>
</svg>
        <h1 style='color: #ffff00'>You are offline</h1>
        <p style='color: #ffaa56'>Please connect to the internet to use TypeChat</p>
      </div>
    </body>
    </html>`,
  { status: 503, headers: { "Content-Type": "text/html" } }
);
let html200;
(async () => {
  html200 = await fetch("/200.html");
})();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (url.search != "?nocache" && event.request.method == "GET")
          cached[event.request.url] = resp.clone();
        return resp;
      })
      .catch(() => {
        return cached[event.request.url]
          ? cached[event.request.url].clone()
          : event.request.destination == "document"
          ? html200.clone()
          : errorresp.clone();
      })
  );
});
/*
const ws = new WebSocket(
  `${self.location.origin.replace('http', 'ws').replace('3000', '5000')}/notifications-bg`
);


ws.addEventListener("open", () => {
  console.log("connected to notifications-bg");
  ws.send(JSON.stringify({ type: "ping" }));
})

ws.addEventListener(
  'message',
  event => {
    const msg = JSON.parse(event.data);
    console.log(msg)
    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
    } else {
      self.registration.showNotification(msg.title, {
        body: msg.message,
        icon: "/logo.png",
        data: { url: new URL(msg.to, self.location.origin).href},
      });
    }
  }
)*/
