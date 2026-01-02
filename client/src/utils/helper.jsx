export const isUserLoggedIn = () => {
    let loggedInUser = localStorage.getItem("isLoggedIn");
    return loggedInUser ? true : false;
  };
  
export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userDetails");
  };