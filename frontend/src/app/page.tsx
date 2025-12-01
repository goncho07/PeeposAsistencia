'use client';
import React, { useState } from 'react';
import { Mail, Lock, ArrowRightCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Config State for dynamic images (Hardcoded for now as per reference)
  const config = {
    loginBg: 'https://media.discordapp.net/attachments/1383264716536680462/1424262639520977080/image.png?ex=6921eeb2&is=69209d32&hm=6e787937d99f30ed47dd29df751ff998934d42b5a8d1cedf60f1d877ecfac37e&=&format=webp&quality=lossless&width=466&height=350',
    schoolLogo: 'https://media.discordapp.net/attachments/1383264716536680462/1425320993127268492/Diseno_sin_titulo_30.png?ex=69227c9d&is=69212b1d&hm=58b23ca929361cc05e85bd36235cfcfc696b06887350fad5e202438892d8dedf&=&format=webp&quality=lossless&width=1317&height=741',
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login logic
    if (email && password) {
        // In real app, call API
        login('dummy-token', { id: 1, name: 'Director General', email });
    } else {
        // Just for demo, allow quick entry if empty
         login('dummy-token', { id: 1, name: 'Director General', email: 'director@peepos.edu.pe' });
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 font-['Poppins']">
        <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
          <img 
            src={config.loginBg} 
            alt="School Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
          <div className="w-full max-w-md space-y-8">
             <div className="text-center">
                <img 
                  src={config.schoolLogo}
                  alt="School Logo" 
                  className="mx-auto h-48 mb-8 object-contain transition-transform hover:scale-105 duration-500"
                />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ingresa a tu panel de control institucional</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-4">
                <button 
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-gray-700 dark:text-gray-200 font-medium"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continuar con Googleeee
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="grow border-t border-gray-200 dark:border-slate-700"></div>
                  <span className="shrink-0 mx-4 text-gray-400 text-xs uppercase">O ingresa con correo</span>
                  <div className="grow border-t border-gray-200 dark:border-slate-700"></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="director@colegio.edu.pe" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-gray-600 dark:text-gray-400">Recordarme</span></label>
                     <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">¿Olvidaste tu contraseña?</a>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    Ingresar <ArrowRightCircle size={20} />
                  </button>
                </div>
             </form>
             
             <p className="text-center text-sm text-gray-600 dark:text-gray-400">
               ¿No tienes una cuenta? <a href="#" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Regístrate</a>
             </p>
          </div>
        </div>
      </div>
    </>
  );
}