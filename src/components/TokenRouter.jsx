import React, { useEffect, useContext, useState } from 'react';
import { PKCEContext } from '../Context/PKCEContext';
import Home from './Home';

export default function TokenRouter() {
  const [token, setToken] = useState(null);

  const { client_id, client_secret, redirectURL } = useContext(PKCEContext);

  const urlParams = window.location.search;
  const myParams = new URLSearchParams(urlParams);
  const authorize_code = myParams.get('code');

  const pkce_verifier = localStorage.getItem('PKCE');

  useEffect(() => {
    if (authorize_code) {
      (async function () {
        try {
          const params = {
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            code_verifier: pkce_verifier,
            code: authorize_code,
            redirect_uri: redirectURL,
          };
          const response = await fetch(
            'https://sts-identity.intelwash.ru/connect/token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams(params),
            }
          );

          const token = await response.json();

          if (token.error) {
            localStorage.removeItem('PKCE');
            window.location.href = 'https://taskapidomen.ru';
          }

          setToken(token);
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, []);

  return <Home access_token={token} />;
}
