import jwt from 'jsonwebtoken';
export default defineEventHandler(async (event) => {
  const { login, password } = await readBody(event);

  if (!login || !password) {
    return {
      status: 'error',
      message: 'No login or password',
    };
  }

  const authLogin = process.env.LOGIN;
  const authPassword = process.env.PASSWORD;

  if (authLogin !== login || authPassword !== password) {
    return {
      status: 'error',
      message: 'Incorrect login or password',
    };
  }

  const secret = process.env.JWT_SECRET ?? '';
  const token = jwt.sign({ login: login }, secret, { expiresIn: '24h' });

  //TODO если будет https сделать secure и sameSite на проде
  setCookie(event, 'pewpewpew', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/', // send to all routes
    maxAge: 60 * 60 * 24,
  });
  return {
    status: 'success',
    message: 'Successfully auth',
  };
});
