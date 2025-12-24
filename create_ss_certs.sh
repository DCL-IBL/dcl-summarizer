openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout frontend/certs/server.key \
  -out frontend/certs/server.crt \
  -subj "/C=BG/ST=Sofia-Grad/L=Sofia/O=IBL-DCL/CN=localhost"