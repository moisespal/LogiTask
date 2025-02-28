import AuthForm from "../components/Auth/AuthForm"

function LoginPage(){
  return (
    <AuthForm route="/api/token/" method="login"/>

  )


}


export default LoginPage;
