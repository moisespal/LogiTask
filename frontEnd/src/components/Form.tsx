import { useState } from "react";
import api from "../api"
import { useNavigate} from "react-router-dom";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "../constants";
import "./AuthPage.css"


interface FormProps {
    route: string;
    method: string;
}

function Form({ route, method }: FormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (event: React.FormEvent) => {
        setLoading(true);

        event.preventDefault();
        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-container">
            <h1 className="brand">
                Logi<span className="highlight">Task</span>
            </h1>
            <div className="auth-card">
                <h2>{name}</h2>
                <input
                    type="email"
                    value={username}
                    name="email"
                    required
                    placeholder="Email"
                    className="auth-input"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    name="password"
                    required
                    placeholder="password"
                    className="auth-input"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="auth-btn">
                    {name}
                </button>
            </div>
        </form>
    );
}

export default Form