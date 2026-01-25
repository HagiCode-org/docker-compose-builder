import { configureStore } from '@reduxjs/toolkit';
import dockerComposeReducer from './docker-compose/slice';

export const store = configureStore({
  reducer: {
    dockerCompose: dockerComposeReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
