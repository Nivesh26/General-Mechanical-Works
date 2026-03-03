import React from 'react'
import { Link } from 'react-router-dom'
import EngineOil from '../assets/EngineOil.png'
import Brakes from '../assets/Brakekit.png'
import Battery from '../assets/Battery.png'
import Tyre from '../assets/Tyre.png'

const bestSellingProducts = [
  { id: 1, name: 'Engine Oil', price: 'Rs. 3,500', image: EngineOil },
  { id: 2, name: 'Brake Service Kit', price: 'Rs. 5,200', image: Brakes },
  { id: 3, name: 'Battery', price: 'Rs. 6,800', image: Battery },
  { id: 4, name: 'Tyre', price: 'Rs. 3,200', image: Tyre },
]

const Productsuggestion = () => {
  return (
    <section className="w-full py-12 border-t border-gray-100">
      <div className="mx-[80px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Best selling</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellingProducts.map((product) => (
            <Link
              key={product.id}
              to="/productdetail"
              className="group border border-gray-200 rounded-xl bg-white p-4 flex flex-col overflow-hidden transition-all duration-200"
            >
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-3 mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-primary font-semibold text-sm">{product.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Productsuggestion
