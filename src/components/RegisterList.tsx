"use client"

import React from 'react';
import { registers } from '@/registers';
import RegisterVisualizer from './RegisterVisualizer';

const RegisterList = () => {
  return (
    <div className="space-y-4">
      {Object.values(registers).map((register) => (
        <RegisterVisualizer 
          key={register.address} 
          register={register} 
        />
      ))}
    </div>
  );
};

export default RegisterList;
