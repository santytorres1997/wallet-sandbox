import { useState } from 'react';
import api from './services/api';
import './App.css';

function App() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [userData, setUserData] = useState(null);

  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage('Completá nombre, email y contraseña');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setMessageType('error');
      return;
    }

    try {
      setIsRegistering(true);
      setMessage('');
      setMessageType('');

      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      setMessage(response.data.message || 'Usuario registrado correctamente');
      setMessageType('success');

      setName('');
      setPassword('');
      setIsRegisterMode(false);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Error al registrarse');
      setMessageType('error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('Completá email y contraseña');
      setMessageType('error');
      return;
    }

    try {
      setIsLoggingIn(true);
      setMessage('');
      setMessageType('');

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);

      const meResponse = await api.get('/account/me');
      setUserData(meResponse.data);

      setMessage('Login exitoso ✅');
      setMessageType('success');
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Error al iniciar sesión');
      setMessageType('error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setName('');
    setEmail('');
    setPassword('');
    setToEmail('');
    setAmount('');
    setTransactions([]);
    setShowTransactions(false);
    setMessage('');
    setMessageType('');
    setIsRegisterMode(false);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!toEmail || !amount) {
      setMessage('Completá email destino y monto');
      setMessageType('error');
      return;
    }

    if (Number(amount) <= 0) {
      setMessage('El monto debe ser mayor a 0');
      setMessageType('error');
      return;
    }

    if (toEmail === userData?.user?.email) {
      setMessage('No podés transferirte a vos mismo');
      setMessageType('error');
      return;
    }

    try {
      setIsTransferring(true);
      setMessage('');
      setMessageType('');

      const response = await api.post('/account/transfer', {
        toEmail,
        amount: Number(amount),
      });

      setMessage(response.data.message);
      setMessageType('success');

      const meResponse = await api.get('/account/me');
      setUserData(meResponse.data);

      if (showTransactions) {
        const txResponse = await api.get('/account/transactions');
        setTransactions(txResponse.data.transactions);
      }

      setToEmail('');
      setAmount('');
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Error al transferir');
      setMessageType('error');
    } finally {
      setIsTransferring(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      setMessage('');
      setMessageType('');

      const response = await api.get('/account/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Error al cargar movimientos');
      setMessageType('error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getTransactionType = (tx) => {
    if (tx.fromUser?.email === userData?.user?.email) {
      return 'sent';
    }
    return 'received';
  };

  return (
    <div className="container">
      <div className="card">
        {!userData ? (
          <>
            <h1>Wallet Sandbox</h1>
            <p className="subtitle">
              {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
            </p>

            {isRegisterMode ? (
              <form onSubmit={handleRegister} className="form">
                <input
                  type="text"
                  placeholder="Ingresá tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isRegistering}
                />

                <input
                  type="email"
                  placeholder="Ingresá tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isRegistering}
                />

                <input
                  type="password"
                  placeholder="Creá una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isRegistering}
                />

                <button type="submit" disabled={isRegistering}>
                  {isRegistering ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="form">
                <input
                  type="email"
                  placeholder="Ingresá tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                />

                <input
                  type="password"
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                />

                <button type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            )}

            <button
              className="toggle-mode-btn"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setMessage('');
                setMessageType('');
              }}
            >
              {isRegisterMode
                ? '¿Ya tenés cuenta? Iniciá sesión'
                : '¿No tenés cuenta? Registrate'}
            </button>

            {message && <div className={`alert ${messageType}`}>{message}</div>}
          </>
        ) : (
          <>
            <h1>Mi billetera</h1>
            <p className="subtitle">Bienvenido</p>

            <div className="info-box">
              <h2>{userData.user.name}</h2>
              <p>{userData.user.email}</p>
              <h3>Saldo actual</h3>
              <span className="balance">${userData.balance}</span>
            </div>

            <form onSubmit={handleTransfer} className="form transfer-form">
              <input
                type="email"
                placeholder="Email destino"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                disabled={isTransferring}
              />

              <input
                type="number"
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isTransferring}
              />

              <button type="submit" disabled={isTransferring}>
                {isTransferring ? 'Procesando transferencia...' : 'Transferir'}
              </button>
            </form>

            <button
              onClick={() => {
                if (!showTransactions) {
                  loadTransactions();
                }
                setShowTransactions(!showTransactions);
              }}
              className="secondary-btn"
              disabled={loadingTransactions}
            >
              {loadingTransactions
                ? 'Cargando...'
                : showTransactions
                ? 'Ocultar movimientos'
                : 'Ver movimientos'}
            </button>

            {showTransactions && transactions.length > 0 && (
              <div className="transactions-box">
                <h3>Historial</h3>

                {transactions.map((tx) => {
                  const txType = getTransactionType(tx);

                  return (
                    <div key={tx._id} className="transaction-item">
                      <div className="transaction-top">
                        <span
                          className={
                            txType === 'sent'
                              ? 'badge badge-sent'
                              : 'badge badge-received'
                          }
                        >
                          {txType === 'sent' ? 'Enviado' : 'Recibido'}
                        </span>

                        <span
                          className={
                            txType === 'sent'
                              ? 'amount sent'
                              : 'amount received'
                          }
                        >
                          {txType === 'sent' ? '-' : '+'}${tx.amount}
                        </span>
                      </div>

                      <p>
                        <strong>De:</strong> {tx.fromUser?.email}
                      </p>
                      <p>
                        <strong>Para:</strong> {tx.toUser?.email}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{' '}
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {showTransactions && transactions.length === 0 && !loadingTransactions && (
              <div className="transactions-box">
                <h3>Historial</h3>
                <p>No hay movimientos todavía.</p>
              </div>
            )}

            <button onClick={handleLogout} className="logout-btn">
              Cerrar sesión
            </button>

            {message && <div className={`alert ${messageType}`}>{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
