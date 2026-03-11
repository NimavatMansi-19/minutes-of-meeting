"use client";
export default function DeleteUserBtn(props: any) {
  return (
    <>
      <button
        className="btn btn-danger"
        onClick={async () => {
          try {
            await props.deleteFn(props.id);
          } catch (e: any) {
            alert(e.message);
          }
        }}
      >
        Delete
      </button>
    </>
  );
}