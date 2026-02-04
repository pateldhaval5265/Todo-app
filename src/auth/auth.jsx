export const login = () => localStorage.setItem('auth', 'true');
export const logout = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('currentUser');
};
export const isAuthenticated = () => localStorage.getItem('auth') === 'true';
