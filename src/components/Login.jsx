import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import LoginContext from '../contexts/LoginContext'
import GlobalContext from '../contexts/GlobalContext'
import { ROLE_CLASS } from '../constants/roles';
import { Boxes, Truck, Receipt, Users, LayoutDashboard } from 'lucide-react';
import logo from "../assets/logo.png";

function Login() {

    const { user, setUser, pass, setPass, setisloggedin, setRole, setDisplayName } = useContext(LoginContext)
    const { appUsers } = useContext(GlobalContext)
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [showDemo, setShowDemo] = useState(false);

    function login(e) {
        e.preventDefault();
        const match = appUsers.find(item => item.username === user && item.password === pass);
        if (match) {
            if (match.active === false) {
                setError("This account has been deactivated. Contact your Super Admin.");
                setisloggedin(false);
                return;
            }
            setisloggedin(true)
            setRole(match.role)
            setDisplayName(match.username)
            setError("")
            navigate('/dashboard');
        }
        else {
            setError("Incorrect username or password.")
            setisloggedin(false)
        }
    }

    function fillDemo(u) {
        setUser(u.username);
        setPass(u.password);
    }

    return (
        <div className="login-split">
            <div className="login-form-side">
                <div className="login-form-inner">
                    <div className="login-brand-row">
                        <span className="login-brand-mark"><img src={logo} alt="SF" width={"41px"} style={{borderRadius:"9px"}}/></span>
                        <span className="login-brand-name">StockFlow</span>
                    </div>

                    <h2 className="login-heading">Sign in to your dashboard</h2>
                    <p className="login-subheading">Welcome back - enter your details to continue.</p>

                    <form onSubmit={login}>
                        <div className="field" style={{ marginBottom: 16 }}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>

                        <div className="field" style={{ marginBottom: 6 }}>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <button type="submit" className="btn" style={{ marginTop: 18, width: '100%' }}>
                            Log In
                        </button>
                    </form>

                    <button
                        type="button"
                        className="login-demo-toggle"
                        onClick={() => setShowDemo((v) => !v)}
                    >
                        {showDemo ? "Hide demo accounts" : "Try a demo account"}
                    </button>

                    {showDemo && (
                        <div className="login-demo-list">
                            {appUsers.map((u) => (
                                <button
                                    type="button"
                                    key={u.id}
                                    className="login-demo-chip"
                                    onClick={() => fillDemo(u)}
                                >
                                    <span className={`role-badge ${ROLE_CLASS[u.role]}`}>{u.role}</span>
                                    <span className="login-demo-name">{u.username}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <p className="login-foot">Built with ❤️ by<a href="http://www.linkedin.com/in/wareesha-faheem" style={{
    textDecoration: "none",
    color: "#4262a7",
  }}> "Wareesha Faheem"</a></p>
                </div>
            </div>

            <div className="login-visual-side">
                <div className="login-visual-diagram">
                    <div className="login-visual-glow" aria-hidden="true" />

                    <svg className="login-visual-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <line x1="22" y1="24" x2="50" y2="54" />
                        <line x1="14" y1="55" x2="50" y2="54" />
                        <line x1="24" y1="84" x2="50" y2="54" />
                        <line x1="50" y1="54" x2="80" y2="28" />
                    </svg>

                    <span className="login-node login-node-center">
                        <Boxes size={22} />
                    </span>
                    <span className="login-node" style={{ left: "22%", top: "24%" }}>
                        <Truck size={17} />
                    </span>
                    <span className="login-node" style={{ left: "14%", top: "55%" }}>
                        <Receipt size={17} />
                    </span>
                    <span className="login-node" style={{ left: "24%", top: "84%" }}>
                        <Users size={17} />
                    </span>

                    <div className="login-visual-card">
                        <div className="login-visual-card-head">
                            <LayoutDashboard size={13} />
                            <span>Live inventory</span>
                        </div>
                        <div className="login-visual-card-row">
                            <span className="login-visual-dot dot-blue" />
                            <span className="login-visual-bar" />
                            <span className="login-visual-badge">128</span>
                        </div>
                        <div className="login-visual-card-row">
                            <span className="login-visual-dot dot-teal" />
                            <span className="login-visual-bar short" />
                            <span className="login-visual-badge">64</span>
                        </div>
                        <div className="login-visual-card-row">
                            <span className="login-visual-dot dot-amber" />
                            <span className="login-visual-bar" />
                            <span className="login-visual-badge">12</span>
                        </div>
                    </div>
                </div>

                <h3 className="login-visual-tagline">Manage your inventory, effortlessly.</h3>
                <p className="login-visual-subtext">Suppliers, stock, billing, and reports - all in one dashboard.</p>

                <div className="login-visual-dots">
                    <span className="active" />
                    <span />
                    <span />
                </div>
            </div>
        </div>
    )
}

export default Login