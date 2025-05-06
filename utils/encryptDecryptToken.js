import CryptoJS from "crypto-js"
const encryptToken = (token,key)=>{
    const encryptedToken = CryptoJS.AES.encrypt(token,key).toString()
    return encryptedToken;
}
const decryptToken = (encryptedToken,key)=>{
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken,key);
        if(bytes.sigBytes>0){
            const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
            return decryptedToken
        }
    } catch (error) {
        throw new Error("Decryption Failed")
    }
}

export {encryptToken, decryptToken};