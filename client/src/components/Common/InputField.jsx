import React from "react";

const InputField = ({ label, type, name, register, errors, ...rest }) => {
  const getValidationRules = (name) => {
    switch (name) {
      case "email":
        return {
          required: "Email is required",
          pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
        };
      case "password":
        return {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        };
      default:
        return { required: `${label || name} is required` };
    }
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        type={type}
        placeholder={label}
        className={`input input-bordered w-full ${
          errors[name] ? "input-error" : ""
        }`}
        {...register(name, getValidationRules(name))}
        {...rest}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default InputField;
