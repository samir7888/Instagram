import Navigationbar from "../common/Navigationbar";
import { EditProfileSchema } from "../schema";
import {
  currentProfileState,
  loggedInUserProfileState,
} from "../store/atoms/profile";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ChangeEvent, useRef, useState,useEffect } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useSetRecoilState } from "recoil";
import { toFormikValidationSchema } from "zod-formik-adapter";
import axios from "axios";

import { suggestedUsersState } from "../store/atoms/suggestedPeople";

export function Edit() {
  const setProfile = useSetRecoilState(currentProfileState);
  const token = localStorage.getItem("token");
  const [initialValues, setInitialValues] = useState({
    website: "",
    bio: "",
    gender: "",
    receiveMarkettingEmails: false,
    accountType: "",
  });
  
  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/me/userpreferences",{
          headers:{
            'Authorization':`${token}`
          }
        });
        setInitialValues({
          website: res.data.website || "",
          bio: res.data.bio || "",
          gender: res.data.gender || "",
          receiveMarkettingEmails: res.data.receiveMarkettingEmails || false,
          accountType: res.data.accountType || "",
        });
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        toast.error("Failed to load user preferences");
      }
    };

    fetchUserPreferences();
  }, []);

  return (
    <main className="flex h-screen bg-black text-white">
      <div className="hidden md:block border-r border-gray-800 w-[30%]">
        <Navigationbar />
      </div>
      <div className="sm:m-20 mx-auto">
        <h1 className="font-semibold text-xl w-full pb-3">Edit Profile</h1>
        <ChangeDP />
        
        <Formik
          enableReinitialize // Add this to update form when initialValues change
          initialValues={initialValues}
          onSubmit={async (values) => {
            try {
              const res = await axios.post(
                "http://localhost:3000/api/me/userpreferences",
                values, {
                  headers: {
                    Authorization: `${token}`,
                 
                  },
                } // Send values directly
              );
              setProfile(res.data.userDetails); // Update with the correct path
              toast.success("Profile updated successfully");
            } catch (error) {
              console.error("Update error:", error);
              toast.error("Failed to update profile");
            }
          }}
          validationSchema={toFormikValidationSchema(EditProfileSchema)}
        >
          {(formik) => (
            <Form className="flex flex-col gap-2">
              <label>Website</label>
              <Field
                type="text"
                id="website"
                name="website"
                className="focus:ring-transparent border-gray-900 bg-gray-950 rounded-lg"
              />
              <ErrorMessage name="website" component="div" className="text-red-500" />

              <label>Bio</label>
              <Field
                as="textarea" // Changed to textarea for better bio input
                id="bio"
                name="bio"
                className="focus:ring-transparent border-gray-900 bg-gray-950 rounded-lg min-h-[60px]"
              />
              <ErrorMessage name="bio" component="div" className="text-red-500" />

              <label>Gender</label>
              <Field
                name="gender"
                as="select"
                className="bg-gray-950 rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="RATHER_NOT_SAY">Rather Not Say</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="text-red-500" />

              <label>Account Type</label>
              <Field
                name="accountType"
                as="select"
                className="bg-gray-950 rounded-lg"
              >
                <option value="">Select Account Type</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </Field>
              <ErrorMessage name="accountType" component="div" className="text-red-500" />

              <button
                type="submit"
                className="w-auto bg-blue-500 focus:bg-blue-600 hover:bg-blue-600 py-1 px-3 rounded-md text-white transition-colors"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Updating...' : 'Done'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}

function ChangeDP() {
  const [profile, setProfile] = useRecoilState(loggedInUserProfileState);
  const setUser = useSetRecoilState(suggestedUsersState);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const uploadFileToBackend = async (file: File) => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("displayPictureUrl", file); // Match the backend multer field name

      const response = await axios.post(
        "http://localhost:3000/api/me/profile",
        formData, // Send the FormData directly
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update profile after successful upload
      const res = await axios.get("http://localhost:3000/api/me/");
      setProfile({
        id: res.data.id,
        username: res.data.username,
        displayPictureUrl: res.data.displayPictureUrl,
      });
      setUser([
        ...res.data,
        // id: res.data.id,
        // username: res.data.username,
        // displayPictureUrl: res.data.displayPictureUrl,
      ]);

      console.log(res);

      toast.success(response.data.msg);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return toast.error("Image size must be less than 5MB");
    }

    uploadFileToBackend(file); // Pass file directly instead of setting state
  };

  return (
    <div className="flex w-96 justify-between items-center bg-gray-900 px-4 py-2 rounded-2xl">
      <div className="flex items-center gap-2">
        <img
          height={50}
          width={50}
          className="rounded-full"
          src={
            profile.displayPictureUrl
              ? `http://localhost:3000/${profile.displayPictureUrl}`
              : "/path/to/default/image.jpg"
          }
          alt={`${profile.username}'s photo`}
        />
        <span className="text-md font-semibold">{profile.username}</span>
      </div>
      <input
        type="file"
        className="hidden"
        ref={ref}
        onChange={handleFileChange}
        accept="image/*"
      />
      <button
        className={`bg-white text-black font-semibold p-2 rounded-md h-fit ${
          loading ? "opacity-50" : ""
        }`}
        onClick={() => ref.current?.click()}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Change Photo"}
      </button>
    </div>
  );
}
