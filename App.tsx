import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Route = "home" | "jobs" | "create" | "inspection" | "report" | "settings";
type Role = "Administrator" | "Inspector";
type JobStatus = "Assigned" | "In Progress" | "Ready for Review" | "Completed";
type InspectionType = "Building Inspection" | "Pest & Timber" | "Combined Building & Pest";

type Job = {
  id: string;
  client: string;
  address: string;
  type: InspectionType;
  date: string;
  time: string;
  status: JobStatus;
  progress: number;
  inspector: string;
};

const C = {
  navy: "#123B5D",
  deep: "#092B45",
  blue: "#1B75A5",
  pale: "#EAF5FA",
  gold: "#D7A73F",
  goldPale: "#FFF6DF",
  ink: "#172532",
  muted: "#667786",
  line: "#DCE5EA",
  bg: "#F3F7F9",
  white: "#FFFFFF",
  green: "#25845C",
  red: "#C14F4F",
};

const seedJobs: Job[] = [
  { id: "SC-1048", client: "Sarah Mitchell", address: "18 Auburn Street, Parramatta NSW", type: "Combined Building & Pest", date: "15 Jun", time: "9:30 AM", status: "In Progress", progress: 68, inspector: "Afshin Nazari" },
  { id: "SC-1047", client: "David Chen", address: "42 Banksia Road, Liverpool NSW", type: "Pest & Timber", date: "15 Jun", time: "1:00 PM", status: "Assigned", progress: 0, inspector: "Michael Ross" },
  { id: "SC-1046", client: "Emma Wilson", address: "7 Jacaranda Avenue, Blacktown NSW", type: "Building Inspection", date: "14 Jun", time: "11:00 AM", status: "Ready for Review", progress: 100, inspector: "Afshin Nazari" },
  { id: "SC-1045", client: "James Taylor", address: "25 Rivergum Close, Penrith NSW", type: "Pest & Timber", date: "13 Jun", time: "2:30 PM", status: "Completed", progress: 100, inspector: "Michael Ross" },
];

const buildingSections = ["Job Information", "Property", "Accessibility", "Site Conditions", "External", "Roof Exterior", "Roof Space", "Kitchen", "Laundry", "Bathrooms", "Bedrooms", "Living Areas", "Garage", "Subfloor", "Outbuildings", "Corrosion", "Minor Defects", "Major Defects", "Thermal Imaging", "Moisture Testing", "Risk Assessment", "Conclusion", "Terms", "Declaration"];
const pestSections = ["Property", "Accessibility", "Live Termites", "Timber Damage", "Termite Management", "Moisture", "Conducive Conditions", "Safety Hazards", "Risk Assessment", "Conclusion", "Declaration"];
const combinedSections = [...buildingSections.slice(0, -2), "Pest Risk", "Conclusion", "Terms", "Declaration"];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("Administrator");
  const [route, setRoute] = useState<Route>("home");
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [selectedJob, setSelectedJob] = useState<Job>(seedJobs[0]!);
  const [section, setSection] = useState("Property");
  const [inspectionType, setInspectionType] = useState<InspectionType>("Combined Building & Pest");
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [optionModal, setOptionModal] = useState(false);
  const [optionText, setOptionText] = useState("");

  const go = (next: Route) => setRoute(next);
  const openJob = (job: Job) => {
    setSelectedJob(job);
    setSection("Property");
    setRoute(job.status === "Completed" || job.status === "Ready for Review" ? "report" : "inspection");
  };

  if (!loggedIn) {
    return <Login role={role} setRole={setRole} onLogin={() => setLoggedIn(true)} />;
  }

  const title: Record<Route, string> = {
    home: "Dashboard",
    jobs: "All Inspections",
    create: "New Inspection",
    inspection: selectedJob.type,
    report: "Report Preview",
    settings: "Settings",
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.topTitle}>{title[route]}</Text>
            <Text style={styles.topSub}>{role} workspace</Text>
          </View>
          <Avatar role={role} />
        </View>

        <View style={styles.screen}>
          {route === "home" && <Dashboard jobs={jobs} role={role} go={go} openJob={openJob} />}
          {route === "jobs" && <Jobs jobs={jobs} openJob={openJob} onDelete={(job) => confirmDelete(job, setJobs)} go={go} />}
          {route === "create" && <CreateJob type={inspectionType} setType={setInspectionType} onCreate={() => {
            const job: Job = { id: `SC-${1045 + jobs.length}`, client: "Daniel Thompson", address: "61 Parkview Drive, Campbelltown NSW", type: inspectionType, date: "16 Jun", time: "9:00 AM", status: "In Progress", progress: 10, inspector: role === "Administrator" ? "Afshin Nazari" : "Michael Ross" };
            setJobs((current) => [job, ...current]);
            setSelectedJob(job);
            setSection("Property");
            go("inspection");
          }} />}
          {route === "inspection" && <Inspection job={selectedJob} section={section} setSection={setSection} customOptions={customOptions} onAddOption={() => setOptionModal(true)} go={go} />}
          {route === "report" && <Report job={selectedJob} go={go} />}
          {route === "settings" && <Settings role={role} />}
        </View>

        <BottomNav route={route} go={go} />
      </View>

      <Modal transparent animationType="fade" visible={optionModal} onRequestClose={() => setOptionModal(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add reusable option</Text>
            <Text style={styles.modalCopy}>This tick box will be available on future inspections.</Text>
            <TextInput value={optionText} onChangeText={setOptionText} autoFocus placeholder="Option label" placeholderTextColor="#91A0AA" style={styles.input} />
            <View style={styles.modalActions}>
              <Button title="Cancel" kind="outline" onPress={() => setOptionModal(false)} />
              <Button title="Add option" onPress={() => {
                if (optionText.trim()) setCustomOptions((items) => [...items, optionText.trim()]);
                setOptionText("");
                setOptionModal(false);
              }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Login({ role, setRole, onLogin }: { role: Role; setRole: (role: Role) => void; onLogin: () => void }) {
  return (
    <SafeAreaView style={styles.loginSafe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.loginScreen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.loginHero}>
          <Logo light />
          <View>
            <Text style={styles.eyebrow}>INSPECT SMARTER. REPORT FASTER.</Text>
            <Text style={styles.heroTitle}>Every detail.{"\n"}One clear report.</Text>
            <Text style={styles.heroCopy}>Your secure building and pest inspection workspace, wherever the job takes you.</Text>
          </View>
        </View>
        <View style={styles.loginCard}>
          <Text style={styles.pageTitle}>Welcome back</Text>
          <Text style={styles.pageCopy}>Sign in to manage your inspections.</Text>
          <Field label="Email address" value="admin@sitescop.com.au" />
          <Field label="Password" value="sitescop2026" secure />
          <Text style={styles.fieldLabel}>Demo role</Text>
          <View style={styles.roleRow}>
            {(["Administrator", "Inspector"] as Role[]).map((item) => (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleChoice, role === item && styles.roleChoiceActive]}>
                <Ionicons name={item === "Administrator" ? "shield-checkmark-outline" : "person-outline"} size={18} color={role === item ? C.blue : C.muted} />
                <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="Sign in to SITESCOP" full onPress={onLogin} icon="arrow-forward" />
          <Text style={styles.demoNote}>Demo credentials are pre-filled. No live customer information is stored in this build.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Dashboard({ jobs, role, go, openJob }: { jobs: Job[]; role: Role; go: (r: Route) => void; openJob: (j: Job) => void }) {
  const visibleJobs = jobs;
  const inProgress = visibleJobs.filter((j) => j.status === "In Progress");
  const completed = visibleJobs.filter((j) => j.status === "Completed" || j.status === "Ready for Review");
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <View style={styles.flex}><Text style={styles.pageTitle}>Good morning</Text><Text style={styles.pageCopy}>{role === "Administrator" ? "Admin and technician can create and start inspections." : "Technician can create inspections, but password changes stay admin-controlled."}</Text></View>
        <Pressable style={styles.addCircle} onPress={() => go("create")}><Ionicons name="add" size={27} color={C.white} /></Pressable>
      </View>

      <View style={styles.statsRow}>
        <Stat label="In progress" value={String(inProgress.length)} icon="construct-outline" />
        <Stat label="Due today" value="3" icon="calendar-outline" />
        <Stat label="Completed" value={String(completed.length)} icon="checkmark-circle-outline" />
      </View>

      <View style={styles.card}>
        <CardHeader title="Active inspections" action="View all" onPress={() => go("jobs")} />
        {visibleJobs.slice(0, 3).map((job) => <JobRow key={job.id} job={job} onPress={() => openJob(job)} />)}
      </View>

      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.quickGrid}>
        <QuickAction icon="add-circle-outline" label="New Inspection" accent="blue" onPress={() => go("create")} />
        <QuickAction icon="time-outline" label="In Progress" accent="gold" onPress={() => go("jobs")} />
        <QuickAction icon="checkmark-done-outline" label="Completed Jobs" accent="green" onPress={() => openJob(completed[0] ?? jobs[0]!)} />
        <QuickAction icon="document-text-outline" label="Contract Link" accent="navy" onPress={() => Alert.alert("Contract link", "Production will send the inspection agreement link before the report workflow.")} />
      </View>
    </ScrollView>
  );
}

function Jobs({ jobs, openJob, onDelete, go }: { jobs: Job[]; openJob: (j: Job) => void; onDelete: (j: Job) => void; go: (r: Route) => void }) {
  const [query, setQuery] = useState("");
  const filtered = jobs.filter((j) => `${j.id} ${j.client} ${j.address}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headingRow}><View style={styles.flex}><Text style={styles.pageTitle}>All inspections</Text><Text style={styles.pageCopy}>Search completed and in-progress inspections.</Text></View><Button title="New" onPress={() => go("create")} icon="add" /></View>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={20} color={C.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Client, address or job number" placeholderTextColor="#91A0AA" style={styles.searchInput} /></View>
      <View style={styles.card}>{filtered.map((job) => <JobRow key={job.id} job={job} onPress={() => openJob(job)} onDelete={() => onDelete(job)} />)}</View>
    </ScrollView>
  );
}

function CreateJob({ type, setType, onCreate }: { type: InspectionType; setType: (t: InspectionType) => void; onCreate: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.pageTitle}>New inspection</Text><Text style={styles.pageCopy}>Technician enters agency, client, property and starts the inspection.</Text>
      <View style={styles.cardPad}>
        <Text style={styles.cardTitle}>Agency and inspection details</Text>
        <Field label="Agency name" value="Sample Realty Group" />
        <View style={styles.twoColumns}><View style={styles.flex}><Field label="Agency mobile" value="0400 222 333" /></View><View style={styles.flex}><Field label="Agency email" value="agent@example.com" /></View></View>
        <Field label="Inspection agreement link" value="Send link with contract before report" />
        <Text style={styles.cardTitle}>Client and property</Text>
        <Field label="Client name" value="Daniel Thompson" />
        <Field label="Mobile" value="0412 345 678" />
        <Field label="Email" value="daniel@example.com" />
        <Field label="Property address" value="61 Parkview Drive, Campbelltown NSW" />
        <View style={styles.twoColumns}><View style={styles.flex}><Field label="Date" value="16 June 2026" /></View><View style={styles.flex}><Field label="Time" value="9:00 AM" /></View></View>
        <Text style={styles.fieldLabel}>Inspection type</Text>
        <View style={styles.typeStack}>
          <TypeChoice title="Building Inspection" icon="home-outline" selected={type === "Building Inspection"} onPress={() => setType("Building Inspection")} />
          <TypeChoice title="Pest & Timber" icon="bug-outline" selected={type === "Pest & Timber"} onPress={() => setType("Pest & Timber")} />
          <TypeChoice title="Combined Building & Pest" icon="layers-outline" selected={type === "Combined Building & Pest"} onPress={() => setType("Combined Building & Pest")} />
        </View>
        <Text style={styles.fieldLabel}>Technician</Text>
        <View style={styles.staticField}><Text style={styles.staticText}>Afshin Nazari</Text><Ionicons name="chevron-down" size={18} color={C.muted} /></View>
        <Button title="Start inspection" full onPress={onCreate} icon="arrow-forward" />
      </View>
    </ScrollView>
  );
}

function Inspection({ job, section, setSection, customOptions, onAddOption, go }: { job: Job; section: string; setSection: (s: string) => void; customOptions: string[]; onAddOption: () => void; go: (r: Route) => void }) {
  const sections = job.type === "Pest & Timber" ? pestSections : job.type === "Combined Building & Pest" ? combinedSections : buildingSections;
  const index = sections.indexOf(section);
  return (
    <View style={styles.flex}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionTabs} contentContainerStyle={styles.sectionTabsInner}>
        {sections.map((item, i) => <Pressable key={item} onPress={() => setSection(item)} style={[styles.sectionTab, item === section && styles.sectionTabActive]}><View style={[styles.sectionNumber, i < index && styles.sectionNumberDone]}><Text style={styles.sectionNumberText}>{i < index ? "✓" : i + 1}</Text></View><Text style={[styles.sectionTabText, item === section && styles.sectionTabTextActive]}>{item}</Text></Pressable>)}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.inspectionContent} keyboardShouldPersistTaps="handled">
        <View style={styles.saveState}><View style={styles.saveDot} /><Text style={styles.saveText}>Saved on this device · ready to sync</Text></View>
        <View style={styles.cardPad}>
          <Text style={styles.cardTitle}>{section}</Text>
          <Text style={styles.cardCopy}>{sectionCopy(section, job.type)}</Text>
          {inspectionQuestions(section, customOptions, onAddOption)}
        </View>
      </ScrollView>
      <View style={styles.inspectionFooter}>
        <Button title="Back" kind="outline" onPress={() => index > 0 && setSection(sections[index - 1]!)} />
        <Button title={index === sections.length - 1 ? "Preview report" : "Save & continue"} onPress={() => index === sections.length - 1 ? go("report") : setSection(sections[index + 1]!)} icon="arrow-forward" />
      </View>
    </View>
  );
}

function inspectionQuestions(section: string, customOptions: string[], onAddOption: () => void) {
  if (section === "Job Information") return <>
    <Field label="Agency name" value="Sample Realty Group" />
    <View style={styles.twoColumns}><View style={styles.flex}><Field label="Agency mobile" value="0400 222 333" /></View><View style={styles.flex}><Field label="Agency email" value="agent@example.com" /></View></View>
    <Field label="Client name" value="Daniel Thompson" />
    <Field label="Property address" value="61 Parkview Drive, Campbelltown NSW" />
    <Question title="Client type" options={["Owner", "Purchaser", "Agent", "Other"]} selected="Purchaser" single />
    <Question title="Agreement status" options={["Contract link sent", "Client signed", "Pending signature"]} selected="Contract link sent" single />
  </>;
  if (section === "Property") return <>
    <Question title="Property type" options={["Detached House", "Duplex", "Unit", "Townhouse"]} selected="Detached House" single />
    <View style={styles.twoColumns}><View style={styles.flex}><Field label="Floors" value="2" /></View><View style={styles.flex}><Field label="Living areas" value="2" /></View></View>
    <View style={styles.twoColumns}><View style={styles.flex}><Field label="Bedrooms" value="4" /></View><View style={styles.flex}><Field label="Bathrooms" value="2" /></View></View>
    <Text style={styles.infoNote}>Bedrooms and bathrooms auto-generate from these numbers. Names can be changed later, for example Master Bedroom, Bedroom 2, Main Bathroom, Ensuite.</Text>
    <Question title="Wall construction" options={["Brick Veneer", "Double Brick", "Hebel", "Cladding", ...customOptions]} selected="Brick Veneer" />
    <AddOption onPress={onAddOption} />
    <PhotoPanel title="Property front photo" count={1} />
  </>;
  if (section === "Accessibility") return <>
    <Question title="Readily accessible areas" options={["Building Interior", "Building Exterior", "Roof Space", "Subfloor", "Site", "Outbuildings"]} selected="Building Interior" />
    <Question title="Interior obstructions" options={["Wall Linings", "Floor Coverings", "Cabinetry", "Furniture", "Stored Goods", "Not Applicable"]} selected="Furniture" />
    <AddOption onPress={onAddOption} />
    <Field label="One-off inaccessible area notes" value="Furniture and stored goods limited access to sections of the garage." multiline />
    <Question title="Undetected damage risk" options={["Low", "Moderate", "Moderate to High", "High", "Extreme"]} selected="Moderate" single />
    <Field label="Reason for not inspected / inaccessible area" value="If not selected in the PDF, show the reason here: danger, door closed, locked room, unsafe access, stored goods, or not applicable." multiline />
  </>;
  if (section === "Kitchen") return <>
    <Question title="Cabinet doors closing and opening properly" options={["Yes", "No"]} selected="Yes" single />
    <Question title="Cabinet condition" options={["Good", "Fair", "Poor", "Damaged"]} selected="Good" single />
    <Question title="Sink and drainage" options={["Good", "Fair", "Poor", "Not Blocked", "Partially Blocked", "Blocked", "Leak Inside Cabinet"]} selected="Good" />
    <Question title="Benchtop type and damage" options={["Stone", "Laminate", "Timber", "Concrete", "Cracked", "Broken", "Chipped", "Water Damage"]} selected="Stone" />
    <Question title="Walls / ceiling / floor" options={["Cracking", "Moisture Damage", "Hole/Damage", "Sagging", "Staining", "No Visible Defects"]} selected="No Visible Defects" />
    <Question title="Electrical" options={["Lights Working", "Lights Not Working", "Switches Working", "Power Points Working", "Power Points Damaged"]} selected="Lights Working" />
    <Field label="Kitchen comments" value="Kitchen appliances are not part of this inspection. Electrical and plumbing appliances should be assessed by licensed tradespersons." multiline />
    <PhotoPanel title="Kitchen photos" count={2} />
  </>;
  if (section === "Laundry") return <>
    <Question title="Cabinet and moisture" options={["Cabinet Damage No", "Cabinet Damage Yes", "Moisture Damage No", "Moisture Damage Yes"]} selected="Cabinet Damage No" />
    <Question title="Trough, taps and drainage" options={["Good", "Fair", "Poor", "Not Blocked", "Partially Blocked", "Blocked", "Dripping", "Active Leak"]} selected="Good" />
    <Question title="Water pooling" options={["No", "Yes", "Inadequate Fall", "Blocked Waste", "Plumbing Leak", "Overflow Event"]} selected="No" />
    <Question title="Walls / ceiling / floor" options={["Cracking", "Moisture Damage", "Hole/Damage", "Sagging", "Staining", "No Visible Defects", "Water Damage"]} selected="No Visible Defects" />
    <Question title="Door / window / services" options={["Window Good", "Window Lock Yes", "Door Good", "Lock/Latch Yes", "Lights Working", "Exhaust Fan Working"]} selected="Door Good" />
    <Field label="Laundry comments" value="" multiline />
    <PhotoPanel title="Laundry photos" count={2} />
  </>;
  if (section === "Bathrooms") return <>
    <Text style={styles.infoNote}>Bathrooms auto-generate from the property count. If a bathroom is not accessible, keep it in the PDF and show the reason.</Text>
    <Question title="Generated bathroom" options={["Main Bathroom", "Ensuite", "Master Bedroom Ensuite", "Separate Toilet"]} selected="Main Bathroom" single />
    <Question title="Bathroom fixtures selected" options={["Toilet", "Vanity Cabinet", "Basin", "Bath", "Shower Base / Tray", "Shower Screen", "Shower Head", "Taps & Mixers", "Floor Waste", "Mirror", "Exhaust Fan", "Power Points"]} selected="Toilet" />
    <Question title="Basin and taps" options={["Single Basin", "Double Basin", "Not Blocked", "Partially Blocked", "Blocked", "Leak Inside Cabinet", "Operating Correctly", "Dripping", "Active Leak"]} selected="Single Basin" />
    <Question title="Shower / screen / silicone" options={["Good", "Fair", "Poor", "Water Escaping", "Damage/Cracks", "Failed/Missing Silicone", "Mould Present"]} selected="Good" />
    <Question title="Water pooling reason" options={["No Pooling", "Inadequate Fall to Floor Waste", "Back Fall to Floor Waste", "Uneven Tiles", "Water Retained in Shower Niche"]} selected="No Pooling" />
    <Question title="Moisture damage" options={["None", "Minor", "Moderate", "Major", "Moisture Meter Photo", "Thermal Imaging Photo"]} selected="None" />
    <Field label="Bathroom comments" value="" multiline />
    <PhotoPanel title="Bathroom photos" count={3} />
  </>;
  if (section === "Bedrooms") return <>
    <Text style={styles.infoNote}>Bedroom names can be changed, for example Master Bedroom, Bedroom 2, Guest Bedroom.</Text>
    <Question title="Generated bedroom" options={["Master Bedroom", "Bedroom 2", "Bedroom 3", "Bedroom 4"]} selected="Master Bedroom" single />
    <Question title="Door / handle / window" options={["Good", "Fair", "Poor", "Damaged", "Broken", "N/A"]} selected="Good" />
    <Question title="Wardrobe / sliding door / mirror" options={["N/A", "Good", "Fair", "Poor", "Damaged", "Broken"]} selected="N/A" />
    <Question title="Floor type and condition" options={["Carpet", "Timber", "Tiles", "Vinyl", "Good", "Fair", "Poor", "Damaged", "Stained"]} selected="Carpet" />
    <Question title="Walls / ceiling / services" options={["Cracking", "Moisture Damage", "Hole/Damage", "Sagging", "Staining", "No Visible Defects", "Lights Working", "Switches Working", "Smoke Alarm Present"]} selected="No Visible Defects" />
    <Field label="Bedroom comments" value="" multiline />
    <PhotoPanel title="Bedroom photos" count={2} />
  </>;
  if (section === "Living Areas") return <>
    <Question title="Living area name" options={["Front Living", "Back Living", "Family Room", "Rumpus Room"]} selected="Front Living" single />
    <Question title="Doors / windows / sliding doors" options={["N/A", "Good", "Fair", "Poor", "Damaged", "Broken"]} selected="Good" />
    <Question title="Floor / walls / ceiling" options={["Carpet", "Timber", "Tiles", "Vinyl", "Cracking", "Moisture Damage", "Hole/Damage", "Sagging", "No Visible Defects"]} selected="No Visible Defects" />
    <Question title="Services" options={["Lights Working", "Switches Working", "Power Points Working", "Power Points Damaged", "Smoke Alarm Present", "Unable to Test"]} selected="Lights Working" />
    <Field label="Living area comments" value="" multiline />
    <PhotoPanel title="Living area photos" count={2} />
  </>;
  if (section === "Pest Risk" || section === "Risk Assessment") return <>
    <Question title="Pest / inspection risk" options={["Low", "Low To Moderate", "Moderate", "Moderate To High", "High", "Extreme"]} selected="High" single />
    <Text style={styles.infoNote}>Client requested pest risk to default to High. Risk must also appear in the PDF.</Text>
    <Field label="Risk explanation for PDF" value="Risk rating must be mentioned in the PDF in the same order as the inspection workflow." multiline />
  </>;
  if (section === "Conclusion") return <>
    <Question title="Overall condition" options={["Above Average", "Average", "Below Average", "Well Below Average"]} selected="Average" single />
    <View style={styles.conclusionBox}><Text style={styles.conclusionTitle}>AUTO-GENERATED CONCLUSION</Text><Text style={styles.conclusionText}>The overall condition of the building relative to similar buildings of approximately the same age was considered to be AVERAGE.</Text></View>
    <Field label="Recommendations" value="Licensed plumber recommended. Drainage improvements recommended." multiline />
  </>;
  if (section === "Terms") return <>
    <Question title="Terms included in PDF" options={["Full Legal Disclaimer", "Inspection Limitations", "Scope Of Inspection", "Exclusions"]} selected="Full Legal Disclaimer" />
    <Field label="Terms and conditions note" value="Terms and conditions must be included in the PDF report. Final legal wording must be supplied or approved by the client." multiline />
  </>;
  if (section === "Declaration") return <>
    <Field label="Inspector name" value="Afshin Nazari" />
    <Field label="Licence number" value="" />
    <View style={styles.signature}><Text style={styles.signatureScript}>Afshin Nazari</Text><Text style={styles.signatureLabel}>Inspector signature on file</Text></View>
    <Question title="Report status" options={["Ready for Review", "Complete"]} selected="Ready for Review" single />
  </>;
  const isPest = ["Live Termites", "Timber Damage", "Termite Management", "Conducive Conditions"].includes(section);
  return <>
    <Question title={isPest ? "Evidence found" : "Overall condition"} options={isPest ? ["Yes", "No", "Unable to determine"] : ["Good", "Fair", "Poor", "Not Inspected", "N/A"]} selected={isPest ? "No" : "Fair"} single />
    <Question title="Items observed" options={isPest ? ["Visual inspection", "Sounding", "Probing", "Moisture meter", "Thermal imaging"] : ["No visible defect", "Cracking", "Moisture", "Corrosion", "Damage", "Access restricted"]} selected={isPest ? "Visual inspection" : "No visible defect"} />
    <AddOption onPress={onAddOption} />
    <Field label="Inspector comments" value={isPest ? "No visible evidence was found in the readily accessible areas at the time of inspection." : "Condition was generally fair with maintenance items noted."} multiline />
    <PhotoPanel title={`${section} photos`} count={2} />
  </>;
}

function Report({ job, go }: { job: Job; go: (r: Route) => void }) {
  const ordered = job.type === "Pest & Timber" ? pestSections : job.type === "Combined Building & Pest" ? combinedSections : buildingSections;
  return (
    <ScrollView contentContainerStyle={styles.reportOuter}>
      <View style={styles.reportActions}><Button title="Inspection" kind="outline" onPress={() => go("inspection")} icon="arrow-back" /><Button title="Share PDF" onPress={() => Alert.alert("PDF preview", "The production app will generate and share the approved legal report here.")} icon="share-outline" /></View>
      <View style={styles.reportCover}>
        <Logo light />
        <View><Text style={styles.eyebrow}>PRE-PURCHASE RESIDENTIAL</Text><Text style={styles.reportTitle}>{job.type}{"\n"}Report</Text><Text style={styles.reportAddress}>{job.address}</Text></View>
        <View style={styles.reportMeta}><Meta label="Prepared for" value={job.client} /><Meta label="Inspection date" value={job.date} /><Meta label="Report" value={job.id} /></View>
      </View>
      <View style={styles.reportBody}>
        <Text style={styles.reportHeading}>Inspection summary</Text>
        <View style={styles.reportMetrics}><Metric label="Overall condition" value="Average" /><Metric label="Pest / access risk" value="High" /><Metric label="Major defects" value="1 item" /></View>
        <Text style={styles.reportHeading}>PDF order rule</Text>
        <Text style={styles.reportParagraph}>Everything selected in the inspection appears in the PDF in the same order as the app. If a section is not inspected, the PDF still shows the reason, such as danger, locked door, inaccessible area, or not applicable.</Text>
        <View style={styles.orderList}>{ordered.slice(0, 14).map((item, index) => <Text key={item} style={styles.orderItem}>{index + 1}. {item}</Text>)}</View>
        <Text style={styles.reportHeading}>Significant findings</Text>
        <Finding title="Moisture damage" place="Bathroom / southern wall" text="Further investigation by a qualified waterproofing contractor is recommended." />
        <Finding title="Surface drainage" place="Eastern side of dwelling" text="Improve surface falls and redirect discharge away from the building." />
        <Finding title="Roof covering" place="General roof areas" text="Weathering consistent with the age of the dwelling. Monitor and maintain." />
        <Text style={styles.reportHeading}>Conclusion</Text>
        <Text style={styles.reportParagraph}>Following the inspection of the readily accessible areas, the overall condition relative to similar buildings of approximately the same age was considered to be AVERAGE.</Text>
        <Text style={styles.reportHeading}>Terms and conditions</Text>
        <Text style={styles.reportParagraph}>Full legal disclaimer, inspection limitations, scope of inspection, and exclusions must be included in the PDF report.</Text>
        <Text style={styles.legalNote}>Final legal wording, standards references, exclusions and terms will be loaded after client approval.</Text>
      </View>
    </ScrollView>
  );
}

function Settings({ role }: { role: Role }) {
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.pageTitle}>Account control</Text><Text style={styles.pageCopy}>Client can view account details and control company/report settings.</Text><View style={styles.cardPad}><View style={styles.logoUpload}><Logo /><Text style={styles.uploadText}>Tap to replace company logo</Text></View><Field label="Company name" value="SITESCOP" /><Field label="Business email" value="info@sitescop.com.au" /><Field label="Phone" value="0400 000 000" /><Field label="Website" value="https://sitescop.com.au" /><Text style={styles.sectionLabel}>TEAM & ACCESS</Text><View style={styles.teamRow}><Avatar role="Administrator" /><View style={styles.flex}><Text style={styles.jobClient}>Afshin Nazari</Text><Text style={styles.jobAddress}>Admin · same inspection access as technician · account control</Text></View></View><View style={styles.teamRow}><Avatar role="Inspector" /><View style={styles.flex}><Text style={styles.jobClient}>Michael Ross</Text><Text style={styles.jobAddress}>Technician · can create/start inspections · cannot change password</Text></View></View><Text style={styles.infoNote}>{role === "Inspector" ? "Technician password changes are locked. Ask admin to reset password." : "Admin controls account, users, report settings and password resets."}</Text><Button title="Save changes" full onPress={() => Alert.alert("Saved", "Company settings saved on this device.")} /></View></ScrollView>;
}

function BottomNav({ route, go }: { route: Route; go: (r: Route) => void }) {
  const items: { route: Route; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { route: "home", icon: "grid-outline", label: "Home" },
    { route: "jobs", icon: "briefcase-outline", label: "Jobs" },
    { route: "create", icon: "add-circle-outline", label: "New" },
    { route: "report", icon: "document-text-outline", label: "Report" },
    { route: "settings", icon: "settings-outline", label: "Settings" },
  ];
  return <View style={styles.bottomNav}>{items.map((item) => <Pressable key={item.route} onPress={() => go(item.route)} style={styles.navItem}><Ionicons name={item.icon} size={23} color={route === item.route || (route === "inspection" && item.route === "jobs") ? C.navy : "#7D8D98"} /><Text style={[styles.navText, (route === item.route || (route === "inspection" && item.route === "jobs")) && styles.navTextActive]}>{item.label}</Text></Pressable>)}</View>;
}

function Logo({ light = false }: { light?: boolean }) { return <View style={styles.logo}><View style={styles.logoMark}><Text style={styles.logoLetter}>S</Text></View><Text style={[styles.logoText, light && { color: C.white }]}>SITESCOP</Text></View>; }
function Avatar({ role }: { role: Role }) { return <View style={styles.avatar}><Text style={styles.avatarText}>{role === "Administrator" ? "AN" : "MR"}</Text></View>; }
function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) { return <View style={styles.stat}><View style={styles.statIcon}><Ionicons name={icon} size={19} color={C.navy} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function CardHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) { return <View style={styles.cardHeader}><Text style={styles.cardTitle}>{title}</Text><Pressable onPress={onPress}><Text style={styles.cardAction}>{action} →</Text></Pressable></View>; }

function JobRow({ job, onPress, onDelete }: { job: Job; onPress: () => void; onDelete?: () => void }) {
  const icon = job.type === "Building Inspection" ? "home-outline" : job.type === "Pest & Timber" ? "bug-outline" : "layers-outline";
  return <Pressable onPress={onPress} style={styles.jobRow}><View style={styles.jobIcon}><Ionicons name={icon} size={21} color={C.navy} /></View><View style={styles.flex}><View style={styles.jobTitleRow}><Text style={styles.jobClient} numberOfLines={1}>{job.client}</Text><StatusPill status={job.status} /></View><Text style={styles.jobAddress} numberOfLines={1}>{job.id} · {job.address}</Text><View style={styles.jobMeta}><Text style={styles.jobMetaText}>{job.date} · {job.time}</Text><View style={styles.miniProgress}><View style={[styles.miniProgressFill, { width: `${job.progress}%` }]} /></View></View></View>{onDelete ? <Pressable hitSlop={10} onPress={(event) => { event.stopPropagation(); onDelete(); }}><Ionicons name="trash-outline" size={20} color={C.red} /></Pressable> : <Ionicons name="chevron-forward" size={20} color="#9AA8B1" />}</Pressable>;
}

function StatusPill({ status }: { status: JobStatus }) {
  const map = { "Assigned": ["#E4F3FA", "#17688F"], "In Progress": ["#FFF3CF", "#936B0B"], "Ready for Review": ["#F0E9F8", "#77569B"], "Completed": ["#E3F4EB", "#25714F"] } as const;
  return <View style={[styles.pill, { backgroundColor: map[status][0] }]}><Text style={[styles.pillText, { color: map[status][1] }]}>{status}</Text></View>;
}

function QuickAction({ icon, label, accent = "blue", onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; accent?: "blue" | "gold" | "green" | "navy"; onPress: () => void }) {
  const bg = accent === "gold" ? C.goldPale : accent === "green" ? "#E3F4EB" : accent === "navy" ? "#E7EEF4" : C.pale;
  const fg = accent === "gold" ? "#936B0B" : accent === "green" ? C.green : C.navy;
  return <Pressable onPress={onPress} style={[styles.quickAction, { borderColor: bg, backgroundColor: bg }]}><View style={[styles.quickIcon, { backgroundColor: C.white }]}><Ionicons name={icon} size={23} color={fg} /></View><Text style={[styles.quickLabel, { color: fg }]}>{label}</Text></Pressable>;
}

function Field({ label, value, secure = false, multiline = false }: { label: string; value: string; secure?: boolean; multiline?: boolean }) {
  const [text, setText] = useState(value);
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={text} onChangeText={setText} secureTextEntry={secure} multiline={multiline} placeholder={label} placeholderTextColor="#91A0AA" style={[styles.input, multiline && styles.textarea]} /></View>;
}

function Button({ title, onPress, kind = "primary", full = false, icon }: { title: string; onPress: () => void; kind?: "primary" | "outline"; full?: boolean; icon?: keyof typeof Ionicons.glyphMap }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.button, kind === "outline" ? styles.buttonOutline : styles.buttonPrimary, full && styles.fullButton, pressed && { opacity: .8 }]}>{icon && <Ionicons name={icon} size={18} color={kind === "outline" ? C.navy : C.white} />}<Text style={[styles.buttonText, kind === "outline" && styles.buttonTextOutline]}>{title}</Text></Pressable>; }

function TypeChoice({ title, icon, selected, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.typeChoice, selected && styles.typeChoiceActive]}><View style={styles.typeIcon}><Ionicons name={icon} size={22} color={C.navy} /></View><Text style={styles.typeTitle}>{title}</Text>{selected && <Ionicons name="checkmark-circle" size={22} color={C.blue} />}</Pressable>; }

function Question({ title, options, selected, single = false }: { title: string; options: string[]; selected: string; single?: boolean }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([selected]);
  const toggle = (item: string) => setSelectedItems((current) => single ? [item] : current.includes(item) ? current.filter((x) => x !== item) : [...current, item]);
  return <View style={styles.question}><Text style={styles.fieldLabel}>{title}</Text><View style={styles.chips}>{options.map((item) => { const active = selectedItems.includes(item); return <Pressable key={item} onPress={() => toggle(item)} style={[styles.chip, active && styles.chipActive]}>{active && <Ionicons name="checkmark" size={14} color={C.blue} />}<Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text></Pressable>; })}</View></View>;
}

function AddOption({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress} style={styles.addOption}><Ionicons name="add" size={18} color={C.blue} /><Text style={styles.addOptionText}>Add reusable tick box</Text></Pressable>; }

function PhotoPanel({ title, count }: { title: string; count: number }) { return <View style={styles.question}><Text style={styles.fieldLabel}>{title}</Text><View style={styles.photoRow}>{Array.from({ length: count }, (_, i) => <View key={i} style={styles.samplePhoto}><Ionicons name="image-outline" size={25} color={C.white} /><Text style={styles.samplePhotoText}>Photo {i + 1}</Text></View>)}<Pressable onPress={() => Alert.alert("Photos", "The production build will open the camera and photo library here.")} style={styles.photoAdd}><Ionicons name="camera-outline" size={25} color={C.blue} /><Text style={styles.photoAddText}>Add photo</Text></Pressable></View></View>; }

function Meta({ label, value }: { label: string; value: string }) { return <View style={styles.meta}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function Finding({ title, place, text }: { title: string; place: string; text: string }) { return <View style={styles.finding}><View style={styles.findingDot} /><View style={styles.flex}><Text style={styles.findingTitle}>{title} · {place}</Text><Text style={styles.findingText}>{text}</Text></View></View>; }

function sectionCopy(section: string, type: InspectionType) {
  if (section === "Job Information") return "Agency, client, agreement link and inspection details belong here, not under conditions.";
  if (section === "Property") return "Record the property profile and construction details.";
  if (section === "Accessibility") return "Document accessible areas, obstructions and inspection limitations.";
  if (section === "Conclusion") return "Ratings automatically generate the report conclusion.";
  if (section === "Declaration") return "Confirm and sign the completed inspection.";
  if (section === "Terms") return "Terms and conditions are included in the PDF report.";
  if (section === "Pest Risk" || section === "Risk Assessment") return "Risk must be mentioned in the PDF. Pest risk defaults to High.";
  return `${type} checklist, comments and supporting evidence.`;
}

function confirmDelete(job: Job, setJobs: React.Dispatch<React.SetStateAction<Job[]>>) {
  Alert.alert("Move job to recycle bin?", `${job.id} · ${job.client}\n\nThe job can be restored for 30 days.`, [
    { text: "Cancel", style: "cancel" },
    { text: "Move to recycle bin", style: "destructive", onPress: () => setJobs((current) => current.filter((item) => item.id !== job.id)) },
  ]);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  app: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1 },
  flex: { flex: 1 },
  topbar: { minHeight: 66, paddingHorizontal: 18, paddingVertical: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line },
  topTitle: { color: C.ink, fontSize: 19, fontWeight: "800" },
  topSub: { color: C.muted, fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 30, gap: 16 },
  loginSafe: { flex: 1, backgroundColor: C.deep },
  loginScreen: { flex: 1, backgroundColor: C.bg },
  loginHero: { minHeight: 285, padding: 26, justifyContent: "space-between", backgroundColor: C.deep },
  eyebrow: { color: C.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 10 },
  heroTitle: { color: C.white, fontSize: 38, fontWeight: "900", letterSpacing: -1.4, lineHeight: 41 },
  heroCopy: { color: "#BCD0DD", fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: 330 },
  loginCard: { flex: 1, marginTop: -20, padding: 24, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  logo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.gold },
  logoLetter: { color: C.deep, fontSize: 20, fontWeight: "900" },
  logoText: { color: C.navy, fontSize: 21, fontWeight: "900", letterSpacing: 1.3 },
  pageTitle: { color: C.ink, fontSize: 27, fontWeight: "900", letterSpacing: -.7 },
  pageCopy: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  field: { marginTop: 16 },
  fieldLabel: { color: "#415563", fontSize: 12, fontWeight: "800", marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, color: C.ink, backgroundColor: C.white, fontSize: 14 },
  textarea: { minHeight: 100, paddingTop: 13, textAlignVertical: "top" },
  roleRow: { flexDirection: "row", gap: 9, marginBottom: 18 },
  roleChoice: { flex: 1, minHeight: 52, paddingHorizontal: 10, borderWidth: 1, borderColor: C.line, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  roleChoiceActive: { borderColor: C.blue, backgroundColor: C.pale },
  roleText: { color: C.muted, fontSize: 12, fontWeight: "700" },
  roleTextActive: { color: C.navy },
  demoNote: { color: "#765E25", fontSize: 11, lineHeight: 17, marginTop: 15, padding: 12, borderRadius: 10, backgroundColor: C.goldPale },
  button: { minHeight: 44, borderRadius: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  buttonPrimary: { backgroundColor: C.navy },
  buttonOutline: { borderWidth: 1, borderColor: C.line, backgroundColor: C.white },
  buttonText: { color: C.white, fontSize: 13, fontWeight: "800" },
  buttonTextOutline: { color: C.navy },
  fullButton: { width: "100%", marginTop: 18 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  addCircle: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.navy },
  statsRow: { flexDirection: "row", gap: 9 },
  stat: { flex: 1, padding: 13, borderWidth: 1, borderColor: "#E5ECEF", borderRadius: 15, backgroundColor: C.white },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.pale },
  statValue: { color: C.ink, fontSize: 24, fontWeight: "900", marginTop: 10 },
  statLabel: { color: C.muted, fontSize: 10, marginTop: 1 },
  card: { overflow: "hidden", borderWidth: 1, borderColor: "#E2E9ED", borderRadius: 17, backgroundColor: C.white },
  cardPad: { padding: 18, borderWidth: 1, borderColor: "#E2E9ED", borderRadius: 17, backgroundColor: C.white },
  cardHeader: { minHeight: 57, paddingHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#EDF1F3" },
  cardTitle: { color: C.ink, fontSize: 17, fontWeight: "900" },
  cardCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 20 },
  cardAction: { color: C.blue, fontSize: 12, fontWeight: "800" },
  jobRow: { minHeight: 88, padding: 14, flexDirection: "row", alignItems: "center", gap: 11, borderBottomWidth: 1, borderBottomColor: "#EDF1F3" },
  jobIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.pale },
  jobTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  jobClient: { flex: 1, color: C.ink, fontSize: 13, fontWeight: "800" },
  jobAddress: { color: C.muted, fontSize: 10, marginTop: 4 },
  jobMeta: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  jobMetaText: { color: C.muted, fontSize: 10 },
  miniProgress: { flex: 1, height: 4, overflow: "hidden", borderRadius: 5, backgroundColor: "#E9EFF2" },
  miniProgressFill: { height: 4, borderRadius: 5, backgroundColor: C.blue },
  pill: { minHeight: 22, paddingHorizontal: 8, borderRadius: 12, justifyContent: "center" },
  pillText: { fontSize: 9, fontWeight: "800" },
  sectionLabel: { color: C.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 5 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickAction: { width: "48.4%", minHeight: 78, padding: 13, borderWidth: 1, borderColor: C.line, borderRadius: 14, backgroundColor: C.white },
  quickIcon: { width: 33, height: 33, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: C.pale },
  quickLabel: { color: C.navy, fontSize: 12, fontWeight: "800", marginTop: 8 },
  searchBox: { height: 48, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.line, borderRadius: 12, backgroundColor: C.white },
  searchInput: { flex: 1, color: C.ink, fontSize: 13 },
  twoColumns: { flexDirection: "row", gap: 12 },
  typeStack: { gap: 9, marginBottom: 16 },
  typeChoice: { minHeight: 64, paddingHorizontal: 13, borderWidth: 1.5, borderColor: C.line, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 11 },
  typeChoiceActive: { borderColor: C.blue, backgroundColor: "#F7FCFE" },
  typeIcon: { width: 39, height: 39, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: C.pale },
  typeTitle: { flex: 1, color: C.ink, fontSize: 13, fontWeight: "800" },
  staticField: { height: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: C.line, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  staticText: { color: C.ink, fontSize: 14 },
  sectionTabs: { flexGrow: 0, maxHeight: 62, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line },
  sectionTabsInner: { paddingHorizontal: 10, paddingVertical: 9, gap: 7 },
  sectionTab: { height: 42, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10 },
  sectionTabActive: { backgroundColor: C.pale },
  sectionNumber: { width: 23, height: 23, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#EDF2F4" },
  sectionNumberDone: { backgroundColor: C.green },
  sectionNumberText: { color: C.muted, fontSize: 9, fontWeight: "800" },
  sectionTabText: { color: C.muted, fontSize: 11, fontWeight: "700" },
  sectionTabTextActive: { color: C.navy },
  inspectionContent: { padding: 14, paddingBottom: 30 },
  saveState: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  saveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  saveText: { color: C.muted, fontSize: 10 },
  question: { marginBottom: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { minHeight: 37, paddingHorizontal: 11, borderWidth: 1, borderColor: C.line, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.white },
  chipActive: { borderColor: C.blue, backgroundColor: C.pale },
  chipText: { color: "#4D6170", fontSize: 11 },
  chipTextActive: { color: C.navy, fontWeight: "800" },
  addOption: { alignSelf: "flex-start", minHeight: 38, paddingHorizontal: 12, borderWidth: 1, borderStyle: "dashed", borderColor: "#9DB1BD", borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 5, marginTop: -8, marginBottom: 19 },
  addOptionText: { color: C.blue, fontSize: 11, fontWeight: "800" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  samplePhoto: { width: 102, height: 85, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#597B8B" },
  samplePhotoText: { color: C.white, fontSize: 9, fontWeight: "700", marginTop: 4 },
  photoAdd: { width: 102, height: 85, borderWidth: 1, borderStyle: "dashed", borderColor: "#9FB2BD", borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F9FA" },
  photoAddText: { color: C.blue, fontSize: 9, fontWeight: "700", marginTop: 4 },
  conclusionBox: { padding: 15, borderLeftWidth: 4, borderLeftColor: C.gold, borderRadius: 8, backgroundColor: C.goldPale, marginBottom: 4 },
  conclusionTitle: { color: "#765E25", fontSize: 9, fontWeight: "900", letterSpacing: .8, marginBottom: 7 },
  conclusionText: { color: "#67552D", fontSize: 12, lineHeight: 18 },
  signature: { height: 105, marginVertical: 18, borderWidth: 1, borderStyle: "dashed", borderColor: "#9FB2BD", borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFB" },
  signatureScript: { color: C.navy, fontSize: 22, fontWeight: "600", fontStyle: "italic" },
  signatureLabel: { color: C.muted, fontSize: 9, marginTop: 4 },
  inspectionFooter: { minHeight: 67, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.white },
  reportOuter: { padding: 14, paddingBottom: 30 },
  reportActions: { marginBottom: 12, flexDirection: "row", justifyContent: "space-between" },
  reportCover: { minHeight: 520, padding: 28, justifyContent: "space-between", borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: C.deep },
  reportTitle: { color: C.white, fontSize: 38, lineHeight: 42, fontWeight: "900", letterSpacing: -1.2 },
  reportAddress: { color: "#C4D8E4", fontSize: 14, lineHeight: 21, marginTop: 12 },
  reportMeta: { paddingTop: 18, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.2)", gap: 13 },
  meta: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  metaLabel: { color: "#A9C1D0", fontSize: 10 },
  metaValue: { flex: 1, color: C.white, textAlign: "right", fontSize: 11, fontWeight: "800" },
  reportBody: { padding: 22, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: C.white },
  reportHeading: { color: C.navy, fontSize: 20, fontWeight: "900", marginTop: 10, marginBottom: 15 },
  reportMetrics: { gap: 8, marginBottom: 19 },
  orderList: { gap: 6, padding: 12, borderRadius: 11, backgroundColor: C.bg, marginBottom: 12 },
  orderItem: { color: C.ink, fontSize: 10, lineHeight: 14 },
  metric: { padding: 14, borderRadius: 11, backgroundColor: C.bg },
  metricLabel: { color: C.muted, fontSize: 10 },
  metricValue: { color: C.navy, fontSize: 13, fontWeight: "800", marginTop: 4 },
  finding: { paddingVertical: 13, flexDirection: "row", alignItems: "flex-start", gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  findingDot: { width: 9, height: 9, marginTop: 4, borderRadius: 5, backgroundColor: C.gold },
  findingTitle: { color: C.ink, fontSize: 12, fontWeight: "800" },
  findingText: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  reportParagraph: { color: C.muted, fontSize: 12, lineHeight: 20 },
  legalNote: { color: "#765E25", fontSize: 10, lineHeight: 16, marginTop: 15, padding: 12, borderRadius: 9, backgroundColor: C.goldPale },
  infoNote: { color: "#765E25", fontSize: 10, lineHeight: 16, marginTop: 6, marginBottom: 14, padding: 11, borderRadius: 9, backgroundColor: C.goldPale },
  logoUpload: { height: 125, marginBottom: 8, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderStyle: "dashed", borderColor: "#9FB2BD", borderRadius: 13, backgroundColor: "#F8FAFB" },
  uploadText: { color: C.muted, fontSize: 10 },
  teamRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.gold },
  avatarText: { color: C.deep, fontSize: 12, fontWeight: "900" },
  bottomNav: { minHeight: 69, paddingBottom: Platform.OS === "ios" ? 5 : 0, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.white },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  navText: { color: "#7D8D98", fontSize: 9, fontWeight: "700" },
  navTextActive: { color: C.navy },
  modalBackdrop: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,27,42,.58)" },
  modalCard: { width: "100%", maxWidth: 430, padding: 22, borderRadius: 18, backgroundColor: C.white },
  modalTitle: { color: C.ink, fontSize: 20, fontWeight: "900" },
  modalCopy: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 5 },
  modalActions: { marginTop: 18, flexDirection: "row", justifyContent: "flex-end", gap: 9 },
});
