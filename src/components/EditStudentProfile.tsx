const DataRowInput = forwardRef(({title, info, ...props}: PropsWithChildren<{title: string, info?: string}>, ref: Ref<any>) => (
    <div className="py-1">
        <h5 className="text-xs font-semibold text-gray-500">{title}</h5>
        <input ref={ref} className="text-base appearance-none w-full border-b border-solid border-indigo-400" defaultValue={info} {...props} />
    </div>
))


const EditStudentProfile = () => {
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<StudentData>({
        mode: 'onChange'
    });
    
    return <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
        <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
        {/* @ts-ignore */}
        <DataRowInput {...register("englishName", { required: true })} title="English Name" info={oldUserData.englishName} />
        <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name" info={oldUserData.chineseName} />
        <DataRowInput {...register("studentid", { required: true })} title="Student ID" info={oldUserData.studentid} />
        <DataRowInput {...register("identification", { required: true })} title="Identification Card/Passport" info={oldUserData.identification} />
        <DataRowInput {...register("phone", { required: true })} title="Phone" info={oldUserData.phone} />
        <DataRowInput {...register("facebookURL", { required: true })} title="Facebook URL" info={oldUserData.facebookURL} />
        <DataRowInput {...register("email", { required: true })} title="Active Email" info={oldUserData.email} />
        <DataRowInput {...register("address", { required: true })} title="Address" info={oldUserData.address} />
        <DataRowInput {...register("birthday", { required: true })} title="Birthday" info={oldUserData.birthday} />
        <DataRowInput {...register("class", { required: true })} title="Class" info={oldUserData.class} />
        <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
        <DataRowInput {...register("motherName", { required: true })} title="Mother's Name" info={oldUserData.motherName} />
        <DataRowInput {...register("motherPhone", { required: true })} title="Mother's Phone" info={oldUserData.motherPhone} />
        <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
        <DataRowInput {...register("fatherName", { required: true })} title="Father's Name" info={oldUserData.fatherName} />
        <DataRowInput {...register("fatherPhone", { required: true })} title="Father's Phone" info={oldUserData.fatherPhone} />
        <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
        <DataRowInput {...register("emergencyphone", { required: true })} title="Emergency Phone" info={oldUserData.emergencyphone} />
        <DataRowInput {...register("emergencyrelation", { required: true })} title="Emergency Contact Relation (Parent/Guardian)" info={oldUserData.emergencyrelation} />
        <DataRowInput {...register("specials", { required: true })} title="Specials" info={oldUserData.specials} />
    </form>
}