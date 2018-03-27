## WebRTC Sample

This is a simple implementation of WebRTC for

-   audio and video streaming
-   data channel

### Generating OpenSSL Cert

There are 2 options:

Without passphrase

    openssl req -nodes -new -x509 -keyout server.key -out server.cert

This requires passphrase

    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 356
