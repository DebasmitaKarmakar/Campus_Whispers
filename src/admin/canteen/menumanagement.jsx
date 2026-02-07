import { uploadMenu } from "../../services/canteen/menuservice";

export default function MenuManagement() {
  const handleUpload = () => {
    uploadMenu();
    alert("Menu uploaded");
  };

  return (
    <div>
      <h2>Menu Management</h2>
      <button onClick={handleUpload}>Upload Menu</button>
    </div>
  );
}
