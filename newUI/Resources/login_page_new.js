function HideSignIn () {
        console.log("in hide sign in");
        // $("#login_form").hide();
        document.getElementById("login_form").style.display ="none";
        // $("#register_form").show();
        document.getElementById("register_form").style.display ="block";
        document.getElementById("RegisterMessage").innerText ="Already registered?";
         document.getElementById("sign_up_signin_link").style.onclick =HideSignUp;
         document.getElementById("sign_up_signin_link").innerHTML ="Sign In"+ document.getElementById("sign_up_signin_link");
}
function HideSignUp () {
    console.log("in hide sign up");
        // $("#login_form").show();
        document.getElementById("login_form").style.display ="block";
        // $("#register_form").hide();
        document.getElementById("register_form").style.display ="none";
        document.getElementById("RegisterMessage").innerText ="Not registered?";
           document.getElementById("sign_up_signin_link").style.onclick =HideSignIn;
         document.getElementById("sign_up_signin_link").innerHTML ="Create an account" +document.getElementById("sign_up_signin_link") ;
}