export const checkAuth = () => {
  const userData = localStorage.getItem('userData');
  const authToken = localStorage.getItem('authToken');
  
  if (!userData || !authToken) {
    return null;
  }

  return JSON.parse(userData);
};

export const logout = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  window.location.href = '/';
};