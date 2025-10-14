const Settings = () => {
    return (
        // <div className="flex flex-col justify-center items-center h-screen">
        //     <div className="text-xl">
        //         Settings
        //     </div>
        // </div>
        <div className="grid grid-cols-2">
            <div className="m-4 text-xl flex flex-col gap-2">
                <h1 className="bg-gray-800 p-2">Add Words</h1>
                <input
                    type="text"
                    placeholder="Search words..."
                    className="p-2"
                // className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
            </div>
            <div className="m-4 text-xl flex flex-col">
                <h1 className="bg-gray-800 p-2">Current Words</h1>
            </div>
        </div>
    )
}

export default Settings