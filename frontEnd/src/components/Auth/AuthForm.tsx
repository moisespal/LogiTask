import { useState } from "react";
import api from "../../api"
import { useNavigate} from "react-router-dom";
import "../../styles/components/AuthForm.css";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "../../constants";
import { useQueryClient } from "@tanstack/react-query";


interface FormProps {
    route: string;
    method: string;
}

function AuthForm({ route, method }: FormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (event: React.FormEvent) => {

        event.preventDefault();
        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.clear();
                sessionStorage.clear();
                queryClient.clear();
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
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
                {name === "Login" && (
                    <button type="button" className="auth-btn" onClick={() => navigate('/register')}>
                        Register
                    </button>
                )}
             
            </div>
        </form>
    );
}

export default AuthForm