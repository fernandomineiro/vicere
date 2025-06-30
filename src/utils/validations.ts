import { CONFIG } from '../config/global';

export const validateCPF = (cpf: string): boolean => {
  const strCPF = cpf.replace(/[^\d]/g, '');
  
  if (strCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(strCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(strCPF.charAt(i)) * (10 - i);
  }
  
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(strCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(strCPF.charAt(i)) * (11 - i);
  }
  
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(strCPF.charAt(10))) return false;
  
  return true;
};

export const checkCPFExists = async (cpf: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CONFIG.API_URL}/verifica_cpf.class.php?cpf=${cpf}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    return false;
  }
};