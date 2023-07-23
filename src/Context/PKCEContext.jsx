import { createContext, useEffect, useState } from 'react';

export const PKCEContext = createContext({});

export const ContextProvider = ({ children }) => {
  const [code_challenge, setCode_challenge] = useState('');

  const client_id = 'UiTest.client_ID';
  const client_secret = 'UiTestClientSecret';
  const redirectURL = 'https://taskapidomen.ru/v1/callback';

  function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2); // ?
  }

  function generateRandomString() {
    var array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
  }

  function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  function base64urlencode(a) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function pkce_challenge_from_verifier(randomStr) {
    if (localStorage.getItem('PKCE') === null) {
      localStorage.setItem('PKCE', randomStr);
    }
    const hashed = await sha256(randomStr);
    const base64encoded = base64urlencode(hashed);

    return base64encoded;
  }

  useEffect(() => {
    pkce_challenge_from_verifier(generateRandomString()).then(
      (base64urlencoded) => {
        setCode_challenge(base64urlencoded);
      }
    );
  }, []);

  const contextValue = {
    code_challenge,
    client_id,
    client_secret,
    redirectURL,
  };
  return (
    <PKCEContext.Provider value={contextValue}>{children}</PKCEContext.Provider>
  );
};
