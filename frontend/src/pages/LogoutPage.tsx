import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export function LogoutPage(){const nav=useNavigate(); useEffect(()=>{localStorage.clear(); nav('/login');},[]); return null;}
