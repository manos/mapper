mapper
======

A node.js service that maps (via google maps) markers for POST'd data.

This is just a prototype / test - playing with node.js and express.

Running:
-------
    npm install
    node ./server.js

Browse to: http://localhost:3000/ and click "Start Streaming", and "Stream Some Fake Data."


If you want to feed your own data, refresh the page to stop fake data streaming, then click
"Start Streaming," and post some locations:

    curl -v -H "Content-Type: application/json" -d '{"place": "Sao Paulo, Brazil"}' localhost:3000/submit

