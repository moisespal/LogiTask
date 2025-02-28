import AuthForm from "../components/Auth/AuthForm"


function RegisterPage(){
  return <AuthForm route="api/user/register/" method="register"/>
}


export default RegisterPage;
