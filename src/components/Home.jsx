import React, { useContext, useEffect, useState } from 'react';
import styles from './style.module.css';
import { PKCEContext } from '../Context/PKCEContext';
import jwt_decode from 'jwt-decode';

export default function Home({ access_token, id_token }) {
  const { client_id, client_secret, redirectURL, code_challenge } =
    useContext(PKCEContext);

  const [tokenDecoder, setTokenDecoder] = useState(null);
  const [info, setInfo] = useState(null);
  const [role, setRole] = useState(false);
  const [claims, setClaims] = useState(null);
  const [hiddenData, setHiddenData] = useState('');
  const [hiddenCloseData, setHiddenCloseData] = useState('');

  const [disableBtnUser, setDisableBtnUser] = useState(true);
  const [disableBtnAdmin, setDisableBtnAdmin] = useState(true);
  const [disableBtnLogout, setDisableBtnLogout] = useState(true);
  const [disableBtnAuthorizate, setDisableBtnAuthorizate] = useState(false);

  useEffect(() => {
    if (access_token) {
      setDisableBtnAuthorizate(!disableBtnAuthorizate);
      setDisableBtnLogout(!disableBtnLogout);
      const decodedToken = jwt_decode(access_token.access_token);
      const claims = Object.entries(decodedToken);

      for (let el of claims) {
        if (el.includes('role')) {
          setDisableBtnAdmin(false);
          setDisableBtnUser(true);
          setRole(true);
          break;
        } else {
          setDisableBtnUser(false);
          setRole(false);
          continue;
        }
      }
      setClaims(claims);
    }
  }, [access_token]);

  const handleLogout = async () => {
    window.open('https://sts-identity.intelwash.ru/Account/Logout');
    window.location.href = 'https://taskapidomen.ru';
  };

  const hanldeGetToken = async () => {
    try {
      const queryString = new URLSearchParams({
        client_id: client_id,
        client_secret: client_secret,
        scope: 'openid UiTest.API',
        response_type: 'code',
        code_challenge_method: 'S256',
        code_challenge: code_challenge,
        redirect_uri: redirectURL,
      });
      window.location.href = `https://sts-identity.intelwash.ru/connect/authorize?${queryString}`;
    } catch (err) {
      console.log(err);
    }
  };

  const jwtTokenTable = () => {
    const tableRows = claims.map(([name, value]) => (
      <tr key={name}>
        <td>{name}</td>
        &nbsp;
        <td>{value}</td>
      </tr>
    ));

    setTokenDecoder(tableRows);
  };

  const handleAuthUser = async () => {
    localStorage.removeItem('PKCE');
    setHiddenData('');
    setHiddenCloseData('');
    try {
      const userToken = access_token.access_token;
      const response = await fetch(
        'https://api.intelwash.ru/uitest/v2-Dev/TestData/TestData',
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const responseParse = await response.json();

      jwtTokenTable();
      setInfo({ ...responseParse });
    } catch (err) {
      console.log(err);
    }
  };

  const handleAuthAdmin = async () => {
    localStorage.removeItem('PKCE');
    setHiddenData('');
    setHiddenCloseData('');

    try {
      const adminToken = access_token.access_token;
      const response = await fetch(
        'https://api.intelwash.ru/uitest/v2-Dev/TestData/AdminData',
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      const responseParse = await response.json();

      jwtTokenTable();
      setInfo({ ...responseParse });
    } catch (err) {
      console.log(err);
    }
  };

  const handleGetData = () => {
    if (role) {
      setHiddenData('тут могут быть данные');
    } else {
      setHiddenData('тут могут быть данные для обычного пользователя');
    }
  };

  const getClosedData = () => {
    setHiddenCloseData('тут могут быть закрытые данные');
  };

  return (
    <div className={styles.main}>
      <div className={styles.btnContainer}>
        <button onClick={hanldeGetToken} disabled={disableBtnAuthorizate}>
          Авторизоваться и получить токен доступа
        </button>
        <button onClick={handleAuthUser} disabled={disableBtnUser}>
          Пользователь
        </button>
        <button onClick={handleAuthAdmin} disabled={disableBtnAdmin}>
          Администратор
        </button>
        <button onClick={handleLogout} disabled={disableBtnLogout}>
          Выход
        </button>
      </div>
      <div className={styles.response}>
        <h1>
          {info ? (
            <>
              <div className={styles.responseContainer}>
                <h1>Ответ API:</h1>
                <p>
                  <span>{Object.keys(info)} </span>:&nbsp; {info.userData}
                </p>
                <p>
                  <span>{Object.keys(info)[1]}</span> :&nbsp;
                  {info.timestamp}
                </p>
                <h1>Разбор Claims:</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Имя</th>{' '}
                      <div className={styles.tableHeadWrapper}></div>
                      <th>Значение</th>
                    </tr>
                  </thead>
                  <tbody>{tokenDecoder}</tbody>
                </table>
                <div className={styles.hiddenDtaContainer}>{hiddenData}</div>
                <div className={styles.hiddenDtaContainer}>
                  {hiddenCloseData}
                </div>
              </div>
              <div className={styles.btnGetInfoContainer}>
                {role ? (
                  <>
                    <button onClick={() => handleGetData()}>
                      получить данные
                    </button>
                    <button onClick={() => getClosedData()}>
                      получить закрытые данные
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleGetData()}>
                      получить данные
                    </button>
                    <button disabled>
                      получить закрытые данные <b>(только для админа)</b>
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <h6>
              {!disableBtnUser || !disableBtnAdmin ? (
                <p>Выберите доступного пользователя</p>
              ) : (
                <p>Информация доступа только авторизованым пользователям</p>
              )}
            </h6>
          )}
        </h1>
      </div>
    </div>
  );
}
