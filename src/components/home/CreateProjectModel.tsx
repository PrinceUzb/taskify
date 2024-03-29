import { FieldError, FieldValues, useForm } from "react-hook-form";
import InputWithValidation from "../util/InputWithValidation";
import WithLabel from "../util/WithLabel";
import Model from "../util/Model";
import Item from "../util/Item";
import toast from "react-hot-toast";
import gql from "graphql-tag";
import { createProject } from "../../apollo/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { authed_user } from "../../apollo/queries";

interface Props {
  onClose: () => void;
}
const CREATE_PROJECT = gql`
  ${createProject}
`;
const AUTHED_USER = gql`
  ${authed_user}
`;
const CreateProjectModel = (props: Props) => {
  const { onClose } = props;
  const { data } = useQuery(AUTHED_USER);
  const authUser = data?.currentUser;
  const [createProject] = useMutation(CREATE_PROJECT);

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting: isLoading },
  } = useForm();

  const handleCreateProject = (form: FieldValues) => {
    if (!authUser) return;
    createProject({ variables: { ...form } });
    toast("Created a new project!");
    onClose();
  };

  return (
    <Model
      onSubmit={handleSubmit(handleCreateProject)}
      {...{ onClose, isLoading }}
    >
      <>
        <div className="mb-8">
          <span className="text-c-text text-[22px] font-[600]">
            Create Project
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <InputWithValidation
            label="Project name"
            placeholder="Name of your project"
            register={register("name", {
              required: {
                value: true,
                message: "Project name must not be empty",
              },
            })}
            error={errors.name as FieldError}
            autoFocus
          />
          <InputWithValidation
            label="Project short name"
            placeholder="Short name of your project"
            register={register("key", {
              required: {
                value: true,
                message: "Project short name must not be empty",
              },
            })}
            error={errors.name as FieldError}
            autoFocus
          />
        </div>
      </>
    </Model>
  );
};

export default CreateProjectModel;
