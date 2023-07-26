async function generateRandomBytes(length) {
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    return randomValues;
}

function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

function generateRandomKey() {
    const keyBytes = new Uint8Array(16); // 16 bytes = 128 bits
    window.crypto.getRandomValues(keyBytes);
    document.getElementById("key").value = uint8ArrayToHex(keyBytes);
}

function generateRandomIV() {
    const ivBytes = new Uint8Array(16); // 16 bytes = 128 bits
    window.crypto.getRandomValues(ivBytes);
    document.getElementById("iv").value = uint8ArrayToHex(ivBytes);
}

async function aesCBCEncrypt(key, iv, plaintext) {
    try {
        const encoded = new TextEncoder().encode(plaintext);
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: iv,
            },
            key,
            encoded
        );

        const cipherbytes = new Uint8Array(ciphertext);
        return uint8ArrayToHex(cipherbytes);
    } catch (error) {
        console.log("AES CBC Encryption Error: " + error.message);
        return "";
    }
}

async function aesCBCDecrypt(key, iv, ciphertext) {
    try {
        const cipherbytes = hexToUint8Array(ciphertext);
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: iv,
            },
            key,
            cipherbytes
        );

        const decoded = new TextDecoder().decode(decrypted);
        return decoded;
    } catch (error) {
        console.log("AES CBC Decryption Error: " + error.message);
        return "";
    }
}

async function encrypt() {
    const keyString = document.getElementById("key").value;
    const keyBytes = hexToUint8Array(keyString);
    const ivString = document.getElementById("iv").value;
    const ivBytes = hexToUint8Array(ivString);
    const plaintext = document.getElementById("message").value;

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-CBC",
        true,
        ["encrypt"]
    );

    const ciphertext = await aesCBCEncrypt(key, ivBytes, plaintext);
    document.getElementById("output").value = ciphertext;
}

async function decrypt() {
    const keyString = document.getElementById("key").value;
    const keyBytes = hexToUint8Array(keyString);
    const ivString = document.getElementById("iv").value;
    const ivBytes = hexToUint8Array(ivString);
    const ciphertext = document.getElementById("message").value;

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-CBC",
        true,
        ["decrypt"]
    );

    const plaintext = await aesCBCDecrypt(key, ivBytes, ciphertext);
    document.getElementById("output").value = plaintext;
}

function hexToUint8Array(hexString) {
    return new Uint8Array(
        (hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16))
    );
}

async function exportData() {
    const fname = document.getElementById("name_file").value;
    const key = document.getElementById("key").value;
    const iv = document.getElementById("iv").value;
    const encryptedData = document.getElementById("output").value;

    const data = { key, iv, encryptedData };

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    }));


    a.download = `${fname}.json`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function importData() {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
        const data = JSON.parse(event.target.result);
        document.getElementById("key").value = data.key;
        document.getElementById("iv").value = data.iv;
        document.getElementById("message").value = data.encryptedData;
    };
    reader.readAsText(file);
}