import mongoose from 'mongoose';

const TARIFA_HORA = 5.0; // R$ 5,00 por hora

const CarSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'O campo "marca" é obrigatório.'],
      trim: true,
    },
    modelo: {
      type: String,
      required: [true, 'O campo "modelo" é obrigatório.'],
      trim: true,
    },
    horas: {
      type: Number,
      required: [true, 'O campo "horas" (tempo de permanência) é obrigatório.'],
      min: [0, 'O tempo de permanência deve ser maior ou igual a zero.'],
    },
    valorTotal: {
      type: Number,
      required: true,
      default: function () {
        return (this.horas || 0) * TARIFA_HORA;
      },
    },
    preco: {
      type: Number,
      default: function () {
        return this.valorTotal;
      },
    },
    foto: {
      type: String,
      required: [true, 'O campo "foto" (URL da imagem) é obrigatório.'],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Previne recompilação do Model em recarregamentos Serverless
const Car = mongoose.models.Car || mongoose.model('Car', CarSchema);

export default Car;
