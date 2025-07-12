"use client";

import { useQuery, useMutation } from "urql";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Spinner,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { ProductsQuery } from "@/gql/listProductsMutation";
import { CreateProductMutation } from "@/gql/createProductMutation";
import { DeleteProductMutation } from "@/gql/deleteProductMutation";
import { UpdateProductMutation } from "@/gql/updateProductMutation";

const ProductsPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [createResult, createProduct] = useMutation(CreateProductMutation);
  const [{ data, fetching, error }] = useQuery({ query: ProductsQuery });
  const [deleteResult, deleteProduct] = useMutation(DeleteProductMutation);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [updateResult, updateProduct] = useMutation(UpdateProductMutation);

  useEffect(() => {
    if (data?.products) setProducts(data.products);
  }, [data]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteProduct({ id });
    setDeletingId(null);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEdit = (product: any) => {
    setEditProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description || "");
    setProductPrice(product.price.toString());
    onOpen();
  };

  const onSave = async (close: () => void) => {
    if (editProductId) {
      // Edit mode
      const price = parseFloat(productPrice);
      if (!productName || isNaN(price)) return;
      const result = await updateProduct({
        input: {
          id: editProductId,
          name: productName,
          description: productDescription,
          price: price,
        },
      });
      if (result.data) {
        close();
        setEditProductId(null);
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editProductId
              ? { ...p, name: productName, description: productDescription, price }
              : p
          )
        );
      }
    } else {
      // Create mode
      const price = parseFloat(productPrice);
      if (!productName || isNaN(price)) return;
      const result = await createProduct({
        input: {
          name: productName,
          description: productDescription,
          price: price,
        },
      });
      if (result.data?.createProduct) {
        close();
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setProducts((prev) => [...prev, result.data.createProduct]);
      }
    }
  };

  const onCreate = async (close: () => void) => {
    const price = parseFloat(productPrice);
    if (!productName || isNaN(price)) return;
    const result = await createProduct({
      input: {
        name: productName,
        description: productDescription,
        price: price,
      },
    });
    if (result.data) {
      close();
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      refetch({ requestPolicy: "network-only" });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button color="primary" onPress={onOpen}>
          Create Product
        </Button>
      </div>
      {fetching && <Spinner />}
      {error && <div className="text-red-500">Failed to load products</div>}
      <div className="overflow-x-auto rounded shadow border w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No data is found
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.id}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.description || "-"}</td>
                  <td className="px-4 py-2">${product.price}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      variant="bordered"
                      onPress={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      isLoading={deletingId === product.id && deleteResult.fetching}
                      onPress={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Modal
        size="md"
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={(open) => {
          if (!open) {
            setEditProductId(null);
            setProductName("");
            setProductDescription("");
            setProductPrice("");
          }
          onOpenChange(open);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-sm text-black/70">
                  {editProductId ? "Edit Product" : "New Product"}
                </span>
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Product Name"
                  placeholder="Product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <Input
                  label="Description"
                  placeholder="Product description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
                <Input
                  label="Price"
                  placeholder="0.00"
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </ModalBody>
              <ModalFooter className="border-t">
                <Button variant="ghost" onPress={() => {
                  setEditProductId(null);
                  setProductName("");
                  setProductDescription("");
                  setProductPrice("");
                  onOpenChange(false);
                }}>
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  isLoading={editProductId ? updateResult.fetching : createResult.fetching}
                  onPress={() => onSave(onClose)}
                >
                  {editProductId ? "Save" : "Create Product"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProductsPage;
