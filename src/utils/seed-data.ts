/**
 * SCRIPT DE SEED DATA
 * ====================
 * Este script crea datos de ejemplo para empresas y PDVs en Supabase
 * Para ejecutarlo, llamar a seedEmpresasYPDVs() desde la consola del navegador
 */

import { projectId, publicAnonKey } from './supabase/info';
import { getSupabaseClient } from './supabase/client.tsx';

export async function seedEmpresasYPDVs() {
  try {
    console.log('🌱 Iniciando seed de datos...');
    
    // 1. Crear empresa HoyPecamos
    const empresaResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/test/marcas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        id: 'EMP-HOYPECAMOS',
        nombre: 'HoyPecamos',
        cif: 'B12345678',
        activo: true
      })
    });
    
    if (empresaResponse.ok) {
      const empresaData = await empresaResponse.json();
      console.log('✅ Empresa HoyPecamos creada:', empresaData);
      
      // 2. Crear PDVs para HoyPecamos
      const pdvs = [
        { nombre: 'Tiana', direccion: 'Calle Principal 1, Tiana' },
        { nombre: 'Badalona', direccion: 'Avenida Central 45, Badalona' }
      ];
      
      for (const pdvData of pdvs) {
        const pdvResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/pdvs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            empresaId: 'EMP-HOYPECAMOS',
            nombre: pdvData.nombre,
            direccion: pdvData.direccion,
            activo: true
          })
        });
        
        if (pdvResponse.ok) {
          const pdvResult = await pdvResponse.json();
          console.log(`✅ PDV ${pdvData.nombre} creado:`, pdvResult);
        }
      }
    }
    
    // 3. Crear empresa de ejemplo adicional
    const empresa2Response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/test/marcas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        id: 'EMP-EJEMPLO',
        nombre: 'Empresa Ejemplo',
        cif: 'B87654321',
        activo: true
      })
    });
    
    if (empresa2Response.ok) {
      const empresa2Data = await empresa2Response.json();
      console.log('✅ Empresa Ejemplo creada:', empresa2Data);
      
      // 4. Crear PDVs para Empresa Ejemplo
      const pdvs2 = [
        { nombre: 'Centro', direccion: 'Plaza Mayor 1' },
        { nombre: 'Norte', direccion: 'Avenida Norte 23' }
      ];
      
      for (const pdvData of pdvs2) {
        const pdvResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/pdvs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            empresaId: 'EMP-EJEMPLO',
            nombre: pdvData.nombre,
            direccion: pdvData.direccion,
            activo: true
          })
        });
        
        if (pdvResponse.ok) {
          const pdvResult = await pdvResponse.json();
          console.log(`✅ PDV ${pdvData.nombre} creado:`, pdvResult);
        }
      }
    }
    
    console.log('🎉 Seed completado exitosamente!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en seed:', error);
    return { success: false, error };
  }
}

// Hacer disponible globalmente en el navegador
if (typeof window !== 'undefined') {
  (window as any).seedEmpresasYPDVs = seedEmpresasYPDVs;
}
