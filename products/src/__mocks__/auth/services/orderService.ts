export const subscribeToUserOrders = (_uid: string, callback: (orders: unknown[]) => void) => {
  callback([]);
  return () => {};
};

export const deleteUserOrder = async (_uid: string, _orderId: string) => {};
