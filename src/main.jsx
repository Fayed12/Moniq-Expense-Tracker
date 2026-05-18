// local
import router from './routes/mainRouter.jsx'
import store from './redux/store.js'
import './index.css'

// react
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// redux
import { Provider } from 'react-redux'

// react router
import { RouterProvider } from 'react-router'

// toast
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* toast */}
    <ToastContainer />

    {/* redux provider */}
    <Provider store={store}>
      {/* router */}
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)