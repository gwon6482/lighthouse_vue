import axios from 'axios'

const { VITE_API } = import.meta.env

const createInstance = () => {
  return axios.create({ baseURL: VITE_API })
}

export const req = createInstance()
