import React, { useState } from 'react'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import {
  HiOutlineCog,
  HiOutlineWrench,
  HiOutlineSparkles,
  HiOutlinePaintBrush,
} from 'react-icons/hi2'

const serviceOptions = [
  { id: 'service', title: 'Service Work', description: 'Motorbike care, Servicing', Icon: HiOutlineCog },
  { id: 'tyre', title: 'Tyre Repair', description: 'Tyre Fitting Service', Icon: HiOutlineWrench },
  { id: 'wash', title: 'Bike Wash', description: 'Premium Bike Washing, Deep Cleaning', Icon: HiOutlineSparkles },
  { id: 'engine', title: 'Engine Repair', description: 'Repairing Engine', Icon: HiOutlineCog },
  { id: 'dent', title: 'Dent & Painting', description: 'Repair Dent, Paint', Icon: HiOutlinePaintBrush },
  { id: 'modify', title: 'Modify Bike', description: 'Modifying Bikes, Tune Engine', Icon: HiOutlineWrench },
]

const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
]

// Mock saved bikes (would come from user profile/API when logged in)
const savedBikes = [
  { id: '1', label: 'Honda CB 350 - 1234' },

]
const ADD_NEW_BIKE = 'new'

const BIKE_COMPANIES = ['Honda', 'Yamaha', 'KTM', 'Triumph', 'Suzuki', 'Bajaj', 'Royal Enfield', 'Hero', 'TVS']
const BIKE_COLORS = ['Black', 'Red', 'Blue', 'White', 'Silver', 'Green', 'Yellow', 'Orange', 'Grey']

const MODELS_BY_COMPANY: Record<string, string[]> = {
  Honda: ['CBR 650R', 'CB 350', 'Activa', 'Shine', 'Dio', 'Hornet', 'CB Unicorn', 'X-Blade', 'Livo', 'CB Shine SP'],
  Yamaha: ['R15', 'MT-15', 'FZ', 'FZ-S', 'RayZR', 'R3', 'Fascino', 'Aerox', 'FZ-X', 'R15 V4'],
  KTM: ['Duke 390', 'RC 390', 'Duke 250', 'RC 200', 'Adventure 390', 'Duke 125', 'RC 125', 'Adventure 250', 'Duke 200', 'RC 125 (India)'],
  Triumph: ['Street Triple', 'Bonneville', 'Tiger 900', 'Speed Triple', 'Trident 660', 'Scrambler', 'Rocket 3', 'Tiger 1200', 'Thruxton', 'Speed 400'],
  Suzuki: ['GSX-R', 'Gixxer', 'Gixxer SF', 'Access', 'Burgman', 'V-Strom', 'Intruder', 'Avenis', 'Gixxer 250', 'V-Strom 250'],
  Bajaj: ['Pulsar 150', 'Pulsar 220', 'Dominar', 'Avenger', 'CT 100', 'Platina', 'Pulsar NS', 'Pulsar RS', 'Pulsar N160', 'Chetak'],
  'Royal Enfield': ['Classic 350', 'Hunter 350', 'Meteor 350', 'Himalayan', 'Scram 411', 'Interceptor 650', 'Continental GT', 'Bullet 350', 'Shotgun 650', 'Himalayan 450'],
  Hero: ['Splendor', 'Passion', 'Xtreme', 'Xtec', 'Glamour', 'Super Splendor', 'HF Deluxe', 'Pleasure', 'Maestro', 'Destini'],
  TVS: ['Apache', 'Jupiter', 'Sport', 'Raider', 'Ronin', 'iQube', 'NTorq', 'Apache RTR', 'Scooty', 'XL'],
}

const Service = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [bikeChoice, setBikeChoice] = useState<string>('')
  const [newBikeCompany, setNewBikeCompany] = useState('')
  const [newBikeModel, setNewBikeModel] = useState('')
  const [newBikePlate, setNewBikePlate] = useState('')
  const [newBikeColor, setNewBikeColor] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Static submit - no API for now
  }

  const today = new Date()
  const minDate = today.toISOString().slice(0, 10)
  const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section>
        <div className="mx-[80px] py-12 text-center">
          <h1 className="text-primary font-sec text-3xl sm:text-4xl font-bold tracking-[4px] uppercase">
            Book a service
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Choose a service, pick a date and time, and we’ll take care of your bike.
          </p>
        </div>
      </section>

      <main className="flex-1 mx-[80px] py-10">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Choose service */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Choose service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceOptions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedServiceId(selectedServiceId === s.id ? null : s.id)}
                  className={`rounded-xl p-4 border-2 text-left flex items-start gap-3 transition-colors ${
                    selectedServiceId === s.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <s.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    <p className="text-sm text-gray-600">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Date, time & details */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Date, time & your details</h2>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time slot
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSlot(slot === t ? '' : t)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          slot === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="booking-bike-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Choose bike or add new
                </label>
                <select
                  id="booking-bike-select"
                  value={bikeChoice}
                  onChange={(e) => setBikeChoice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="">Select a bike</option>
                  {savedBikes.map((bike) => (
                    <option key={bike.id} value={bike.id}>
                      {bike.label}
                    </option>
                  ))}
                  <option value={ADD_NEW_BIKE}>Add new bike</option>
                </select>
                {bikeChoice === ADD_NEW_BIKE && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                    <p className="text-sm font-medium text-gray-700">Add new bike details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="new-bike-company" className="block text-xs font-medium text-gray-600 mb-1">
                          Company name
                        </label>
                        <select
                          id="new-bike-company"
                          value={newBikeCompany}
                          onChange={(e) => {
                            setNewBikeCompany(e.target.value)
                            setNewBikeModel('')
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                        >
                          <option value="">Select company</option>
                          {BIKE_COMPANIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="new-bike-model" className="block text-xs font-medium text-gray-600 mb-1">
                          Model
                        </label>
                        <select
                          id="new-bike-model"
                          value={newBikeModel}
                          onChange={(e) => setNewBikeModel(e.target.value)}
                          disabled={!newBikeCompany}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        >
                          <option value="">Select model</option>
                          {newBikeCompany && (MODELS_BY_COMPANY[newBikeCompany] ?? []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="new-bike-plate" className="block text-xs font-medium text-gray-600 mb-1">
                          Number plate
                        </label>
                        <input
                          id="new-bike-plate"
                          type="text"
                          value={newBikePlate}
                          onChange={(e) => setNewBikePlate(e.target.value)}
                          placeholder="e.g. BA 01 1234"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-bike-color" className="block text-xs font-medium text-gray-600 mb-1">
                          Bike color
                        </label>
                        <select
                          id="new-bike-color"
                          value={newBikeColor}
                          onChange={(e) => setNewBikeColor(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                        >
                          <option value="">Select color</option>
                          {BIKE_COLORS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-primary text-primary bg-white cursor-default"
                    >
                      Add bike
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific issues or requests..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Book service
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
      <Copyright />
    </div>
  )
}

export default Service
