import mongoose from 'mongoose';
import Car from '../models/Car.js';
import { connectDB } from '../config/db.js';

const TARIFA_HORA = 5.0; // R$ 5,00 por hora de estacionamento

// Base de dados em memória inicial para fallback e testes locais
let mockCars = [
  {
    _id: '6741ef0a5d4e123456789abc',
    marca: 'Porsche',
    modelo: '911 Carrera S',
    horas: 3,
    valorTotal: 15.0,
    preco: 15.0,
    foto: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '6741ef0a5d4e123456789abd',
    marca: 'Toyota',
    modelo: 'Corolla Altis Hybrid',
    horas: 5,
    valorTotal: 25.0,
    preco: 25.0,
    foto: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    _id: '6741ef0a5d4e123456789abe',
    marca: 'BMW',
    modelo: 'M3 Competition',
    horas: 8,
    valorTotal: 40.0,
    preco: 40.0,
    foto: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateMockId() {
  return new mongoose.Types.ObjectId().toString();
}

/**
 * GET /api/cars
 * Lista todos os carros com horas e valor total de estacionamento
 */
export async function getCars(req, res, next) {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const cars = await Car.find().sort({ createdAt: -1 });
      return res.status(200).json(cars);
    }

    // Modo Mock
    return res.status(200).json(mockCars);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/cars/:id
 * Busca um carro por ID
 */
export async function getCarById(req, res, next) {
  try {
    const { id } = req.params;

    if (process.env.MONGODB_URI) {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Formato de ID inválido.' });
      }

      const car = await Car.findById(id);
      if (!car) {
        return res.status(404).json({ error: 'Carro não encontrado.' });
      }

      return res.status(200).json(car);
    }

    // Modo Mock
    const foundCar = mockCars.find((c) => c._id === id);
    if (!foundCar) {
      return res.status(404).json({ error: 'Carro não encontrado.' });
    }

    return res.status(200).json(foundCar);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cars
 * Cadastra um novo carro na garagem com cálculo automático do valor total (horas * 5)
 */
export async function createCar(req, res, next) {
  try {
    const { marca, modelo, horas, preco, foto } = req.body;

    // Suporta 'horas' diretamente ou deriva de 'preco' para compatibilidade
    const tempoHoras = horas !== undefined && horas !== null ? Number(horas) : (preco !== undefined ? Number(preco) / TARIFA_HORA : null);

    if (!marca || !modelo || tempoHoras === null || !foto) {
      return res.status(400).json({
        error: 'Erro de validação: os campos marca, modelo, horas e foto são obrigatórios.',
      });
    }

    if (isNaN(tempoHoras) || tempoHoras < 0) {
      return res.status(400).json({
        error: 'Erro de validação: o campo horas deve ser um número válido maior ou igual a zero.',
      });
    }

    const valorCalculado = tempoHoras * TARIFA_HORA;

    if (process.env.MONGODB_URI) {
      await connectDB();
      const newCar = await Car.create({
        marca: marca.trim(),
        modelo: modelo.trim(),
        horas: tempoHoras,
        valorTotal: valorCalculado,
        preco: valorCalculado,
        foto: foto.trim(),
      });

      return res.status(201).json(newCar);
    }

    // Modo Mock
    const now = new Date().toISOString();
    const newMockCar = {
      _id: generateMockId(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      horas: tempoHoras,
      valorTotal: valorCalculado,
      preco: valorCalculado,
      foto: foto.trim(),
      createdAt: now,
      updatedAt: now,
    };

    mockCars.unshift(newMockCar);
    return res.status(201).json(newMockCar);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: `Erro de validação: ${messages.join(' ')}` });
    }
    next(error);
  }
}

/**
 * PUT /api/cars/:id
 * Atualiza os dados de um carro na garagem
 */
export async function updateCar(req, res, next) {
  try {
    const { id } = req.params;
    const { marca, modelo, horas, preco, foto } = req.body;

    let tempoHoras;
    let valorCalculado;

    if (horas !== undefined) {
      tempoHoras = Number(horas);
      if (isNaN(tempoHoras) || tempoHoras < 0) {
        return res.status(400).json({
          error: 'Erro de validação: as horas devem ser um número válido maior ou igual a zero.',
        });
      }
      valorCalculado = tempoHoras * TARIFA_HORA;
    } else if (preco !== undefined) {
      const precoNumber = Number(preco);
      if (isNaN(precoNumber) || precoNumber < 0) {
        return res.status(400).json({
          error: 'Erro de validação: o preço deve ser um número válido maior ou igual a zero.',
        });
      }
      valorCalculado = precoNumber;
      tempoHoras = valorCalculado / TARIFA_HORA;
    }

    if (process.env.MONGODB_URI) {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Formato de ID inválido.' });
      }

      const updateData = {};
      if (marca !== undefined) updateData.marca = marca.trim();
      if (modelo !== undefined) updateData.modelo = modelo.trim();
      if (foto !== undefined) updateData.foto = foto.trim();
      if (tempoHoras !== undefined) {
        updateData.horas = tempoHoras;
        updateData.valorTotal = valorCalculado;
        updateData.preco = valorCalculado;
      }

      const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedCar) {
        return res.status(404).json({ error: 'Carro não encontrado.' });
      }

      return res.status(200).json(updatedCar);
    }

    // Modo Mock
    const index = mockCars.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Carro não encontrado.' });
    }

    const existing = mockCars[index];
    const updatedHoras = tempoHoras !== undefined ? tempoHoras : existing.horas;
    const updatedValor = valorCalculado !== undefined ? valorCalculado : (existing.valorTotal || updatedHoras * TARIFA_HORA);

    mockCars[index] = {
      ...existing,
      marca: marca !== undefined ? marca.trim() : existing.marca,
      modelo: modelo !== undefined ? modelo.trim() : existing.modelo,
      horas: updatedHoras,
      valorTotal: updatedValor,
      preco: updatedValor,
      foto: foto !== undefined ? foto.trim() : existing.foto,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json(mockCars[index]);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: `Erro de validação: ${messages.join(' ')}` });
    }
    next(error);
  }
}

/**
 * DELETE /api/cars/:id
 * Remove um carro por ID
 */
export async function deleteCar(req, res, next) {
  try {
    const { id } = req.params;

    if (process.env.MONGODB_URI) {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Formato de ID inválido.' });
      }

      const deleted = await Car.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Carro não encontrado.' });
      }

      return res.status(200).json({
        message: 'Carro removido com sucesso.',
        id,
      });
    }

    // Modo Mock
    const index = mockCars.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Carro não encontrado.' });
    }

    mockCars.splice(index, 1);
    return res.status(200).json({
      message: 'Carro removido com sucesso.',
      id,
    });
  } catch (error) {
    next(error);
  }
}
