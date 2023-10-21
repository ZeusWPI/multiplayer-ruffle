"use strict";

let game_keyup = null;
let game_keydown = null;


window.RufflePlayer = window.RufflePlayer || {};

var callIntervalId = null;

var guest_video_id = null;
var guest_data_id = null;

function on_host_load() {
    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    const container = document.getElementById("container");
    player.style.width = "100%";
    player.style.height = "800px";
    container.appendChild(player);
    player.load("tank-trouble.swf");
    const peer = new Peer();
    console.log("peer=", peer);
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        let conn = peer.connect(guest_data_id);
        conn.on('open', function() {
            console.log("Keyboard connection established");
            // Receive messages
            conn.on('data', function(data) {
                console.log("received data", data);
                window.dispatchEvent(new KeyboardEvent(data["type"], {
                    code: data['code'],
                }));
            });
        });
    });
        

    const videopeer = new Peer();
    callIntervalId = setInterval(function(p) {
        const canvasElt = document.querySelector("ruffle-player")?.shadowRoot.querySelector("canvas");
        if (canvasElt != null) {
            console.log("Canvas exists, setting up call now");
            const stream = canvasElt.captureStream(30); // FPS
            const video_track = stream.getVideoTracks()[0];
            video_track.contentHint = "motion";
            var call = p.call(guest_video_id, stream);
            console.log("stream=", stream);
            // Disabled, we'll re-enable this for lag-compensation
            // document.getElementById("receiving-video").srcObject = stream;
            // document.getElementById("receiving-video").play();
            clearInterval(callIntervalId);
        } else {
            console.log("canvas still null");
        }
    }, 1000, videopeer);
}

function transmitKeystroke(conn, type, event) {
    console.log("transmitting ", type, event);
    conn.send({type: type, code: event.code});
}

var displayPeerIdIntervalId = null;

function on_guest_load() {
    const peer = new Peer();
    
    console.log("peer=", peer);
    peer.on('open', function(id) {
        console.log('Opened, data peer ID is: ' + id);
        guest_data_id = id;
    });
    peer.on('connection', function(conn) {
        document.getElementById("connectiondetails").innerHTML = "";
        conn.on('open', function() {
            console.log("Keyboard connection established");
            document.addEventListener("keyup", function(ev) {transmitKeystroke(conn, "keyup", ev)});
            document.addEventListener("keydown", function(ev) {transmitKeystroke(conn, "keydown", ev)});
        });
    });
    

    const videopeer = new Peer();
    videopeer.on('open', function(id) {
        console.log('Opened, video peer ID is: ' + id);
        guest_video_id = id;
    })
    videopeer.on('call', function(call) {
        console.log("received call");
        call.on('stream', function(stream) {
            console.log("On stream, setting video element to ", stream);
            const video_track = stream.getVideoTracks()[0];
            video_track.contentHint = "motion";
            document.getElementById("receiving-video").srcObject = stream;
            document.getElementById("receiving-video").play();
        });
        call.answer();
    });

    displayPeerIdIntervalId = setInterval(function() {
        if (guest_data_id != null && guest_video_id != null) {
            let combinedID = `${guest_data_id}/${guest_video_id}`
            document.getElementById("connectiondetails").innerHTML = 
                `Please pass your connection ID <input readonly size="${combinedID.length}" value="${combinedID}"></input> to the host.
                The game will automatically start when the host clicks the 'Start game' button`
            clearInterval(displayPeerIdIntervalId);
        } else {
            console.log("still null");
        }
    }, 200);


}

function submit_host_id() {
    let guest_combined_id = document.getElementById("guest_combined_id").value.trim();
    if (guest_combined_id.length == 73) {
        guest_data_id = guest_combined_id.split('/')[0];
        guest_video_id = guest_combined_id.split('/')[1];
        on_host_load();
        document.getElementById("connectiondetails").innerHTML = '';
    } else {
        document.getElementById("error-connectiondetails").innerText = "That does not look right";
    }
}

function click_host() {
    document.getElementById("hostguestchoice").remove();
    document.getElementById("connectiondetails").innerHTML = `
        <p>Please paste the ID you received from the guest</p>
        <input id="guest_combined_id" size="73">
        <button onclick="submit_host_id()">Start game</button>
        <div id="error-connectiondetails"></div>
    `
}

function click_guest() {
    document.getElementById("hostguestchoice").remove();
    on_guest_load();
}
