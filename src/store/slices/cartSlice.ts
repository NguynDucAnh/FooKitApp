import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../types';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartItem[] },
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      const found = state.items.find(i => i.product.id === action.payload.id);
      if (found) found.quantity += 1;
      else state.items.push({ product: action.payload, quantity: 1 });
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
    },
    changeQty(state, action: PayloadAction<{ id: string; qty: number }>) {
      const found = state.items.find(i => i.product.id === action.payload.id);
      if (found) found.quantity = action.payload.qty;
    },
    clearCart(state) { state.items = []; },
  },
});

export const { addItem, removeItem, changeQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
